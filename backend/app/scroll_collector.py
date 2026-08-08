from __future__ import annotations

import re
import threading
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

from .dart_collector import DD373_DART_SERVERS, HEADERS, collector_interval, normalize_title, read_json, summarize, write_json


DATA_DIR = Path(__file__).resolve().parents[1] / "legacy_data"
MARKET_FILE = DATA_DIR / "scroll_market.json"
HISTORY_FILE = DATA_DIR / "scroll_history.json"
FRONTEND_SNAPSHOT_FILE = Path(__file__).resolve().parents[2] / "frontend" / "public" / "data" / "scroll_market.json"
DD373_BASE = "https://www.dd373.com"

# Only collect scrolls that are configured as market instruments. The terms include
# the common shorthand used in public listings while keeping magic/physical scrolls separate.
SCROLLS = {
    "2040801": {"name": "手套攻击卷轴 60%", "terms": ("手套攻击卷轴60", "手套攻击力卷轴60", "手套攻击60", "手套攻60", "60手攻卷", "手攻卷60", "手攻60")},
    "2040802": {"name": "手套攻击卷轴 10%", "terms": ("手套攻击卷轴10", "手套攻击力卷轴10", "手套攻击10", "手套攻10", "10手攻卷", "手攻卷10", "手攻10")},
}

COLLECTOR_STATE = {
    "running": False,
    "lastAttemptAt": "",
    "lastSuccessAt": "",
    "nextRunAt": "",
    "lastError": "",
    "source": "DD373",
}
_collector_lock = threading.Lock()
_collector_started = False


def server_url(server_id: str) -> str:
    return f"{DD373_BASE}/s-063g3j-c-1bxrt8-7ewcb6-{server_id}.html"


def classify_scroll(title: str) -> tuple[str, str] | None:
    normalized = normalize_title(title)
    for scroll_id, definition in SCROLLS.items():
        if any(normalize_title(term) in normalized for term in definition["terms"]):
            return scroll_id, definition["name"]
    return None


def parse_listing(node, expected_server: str, source_url: str) -> dict | None:
    title_node = node.select_one("a.goods-list-title")
    price_node = node.select_one(".goods-price")
    type_node = node.select_one(".game-reputation")
    if not title_node or not price_node or not type_node or "卷轴" not in type_node.get_text(" ", strip=True):
        return None
    title = title_node.get_text(" ", strip=True)
    classified = classify_scroll(title)
    if not classified:
        return None
    scroll_id, scroll_name = classified
    price_match = re.search(r"[￥¥]\s*(\d+(?:\.\d+)?)", price_node.get_text(" ", strip=True))
    if not price_match:
        return None
    price = float(price_match.group(1))
    if price <= 0:
        return None
    area_links = node.select(".normalGoodsArea0 .game-qufu-value a, [class*='normalGoodsArea'] .game-qufu-value a")
    server = area_links[-1].get_text(" ", strip=True) if area_links else expected_server
    if server != expected_server:
        return None
    href = urljoin(DD373_BASE, title_node.get("href", ""))
    listing_id = href.rsplit("/", 1)[-1].removeprefix("detail-").removesuffix(".html")
    inventory_match = re.search(r"库存[：:]\s*(\d+(?:\.\d+)?)", type_node.get_text(" ", strip=True))
    inventory = float(inventory_match.group(1)) if inventory_match else 1
    return {
        "id": f"dd-scroll:{listing_id}",
        "scrollId": scroll_id,
        "scrollName": scroll_name,
        "title": title,
        "edition": "怀旧服",
        "area": "国服",
        "server": server,
        "priceCny": round(price, 2),
        "inventory": int(inventory) if inventory.is_integer() else inventory,
        "url": href or source_url,
        "source": "DD373",
    }


def page_urls(soup: BeautifulSoup, source_url: str, server_id: str) -> list[str]:
    urls = {source_url}
    for link in soup.select(".footer-pagination a[href]"):
        href = urljoin(DD373_BASE, link.get("href", ""))
        if server_id in href and "c-1bxrt8" in href:
            urls.add(href)
    return sorted(urls)[:5]


def collect_server(session: requests.Session, server: str, server_id: str) -> list[dict]:
    source_url = server_url(server_id)
    response = session.get(source_url, headers={**HEADERS, "Referer": DD373_BASE}, timeout=30)
    response.raise_for_status()
    response.encoding = "utf-8"
    soup = BeautifulSoup(response.text, "html.parser")
    listings = []
    seen = set()
    for index, page_url in enumerate(page_urls(soup, source_url, server_id)):
        page_soup = soup
        if index or page_url != source_url:
            page_response = session.get(page_url, headers={**HEADERS, "Referer": source_url}, timeout=30)
            page_response.raise_for_status()
            page_response.encoding = "utf-8"
            page_soup = BeautifulSoup(page_response.text, "html.parser")
        for node in page_soup.select(".goods-list-item"):
            item = parse_listing(node, server, page_url)
            if item and item["id"] not in seen:
                listings.append(item)
                seen.add(item["id"])
    return listings


def build_groups(items: list[dict]) -> dict:
    grouped: dict[str, list[dict]] = {}
    for item in items:
        grouped.setdefault(f"{item['scrollId']}|{item['area']} / {item['server']}", []).append(item)
    return {key: summarize(rows) for key, rows in grouped.items()}


def append_history(items: list[dict], sampled_at: str) -> list[dict]:
    rows = read_json(HISTORY_FILE, [])
    if not isinstance(rows, list):
        rows = []
    for key, summary in build_groups(items).items():
        scroll_id, server_key = key.split("|", 1)
        rows.append({
            "sampledAt": sampled_at,
            "scrollId": scroll_id,
            "scrollName": SCROLLS[scroll_id]["name"],
            "serverKey": server_key,
            **summary,
        })
    rows = rows[-5000:]
    write_json(HISTORY_FILE, rows)
    return rows


def collect_once() -> dict:
    session = requests.Session()
    items, errors = [], []
    for server, server_id in DD373_DART_SERVERS.items():
        try:
            items.extend(collect_server(session, server, server_id))
        except Exception as exc:
            errors.append(f"{server}: {exc}")
    if not items and errors:
        raise RuntimeError("；".join(errors))
    sampled_at = datetime.now(timezone.utc).isoformat()
    history = append_history(items, sampled_at)
    payload = {
        "source": "dd373",
        "sourceName": "DD373",
        "sourceUrl": f"{DD373_BASE}/s-063g3j-c-1bxrt8-7ewcb6.html",
        "sampledAt": sampled_at,
        "items": sorted(items, key=lambda item: (item["scrollId"], item["server"], item["priceCny"])),
        "summary": {"count": len(items)},
        "summaryByGroup": build_groups(items),
        "servers": [{"key": f"国服 / {server}", "name": server} for server in DD373_DART_SERVERS],
        "scrolls": [{"id": scroll_id, "name": definition["name"]} for scroll_id, definition in SCROLLS.items()],
        "recentHistory": history[-1200:],
        "errors": errors,
    }
    write_json(MARKET_FILE, payload)
    write_json(FRONTEND_SNAPSHOT_FILE, payload)
    return payload


def load_market_payload() -> dict:
    payload = read_json(MARKET_FILE, {"items": [], "summary": {"count": 0}})
    if not isinstance(payload, dict):
        payload = {"items": [], "summary": {"count": 0}}
    payload["collector"] = dict(COLLECTOR_STATE)
    payload.setdefault("servers", [{"key": f"国服 / {server}", "name": server} for server in DD373_DART_SERVERS])
    payload.setdefault("scrolls", [{"id": scroll_id, "name": definition["name"]} for scroll_id, definition in SCROLLS.items()])
    return payload


def _collector_loop() -> None:
    while True:
        interval = collector_interval()
        now = datetime.now(timezone.utc)
        with _collector_lock:
            COLLECTOR_STATE.update({"running": True, "lastAttemptAt": now.isoformat(), "nextRunAt": (now + timedelta(minutes=interval)).isoformat(), "lastError": ""})
        try:
            collect_once()
            with _collector_lock:
                COLLECTOR_STATE["lastSuccessAt"] = datetime.now(timezone.utc).isoformat()
        except Exception as exc:
            with _collector_lock:
                COLLECTOR_STATE["lastError"] = str(exc)[:500]
        finally:
            with _collector_lock:
                COLLECTOR_STATE["running"] = False
        threading.Event().wait(interval * 60)


def start_scroll_collector() -> None:
    global _collector_started
    with _collector_lock:
        if _collector_started:
            return
        _collector_started = True
    threading.Thread(target=_collector_loop, daemon=True, name="scroll-market-collector").start()
