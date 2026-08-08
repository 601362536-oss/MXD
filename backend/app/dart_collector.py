from __future__ import annotations

import json
import re
import threading
from datetime import datetime, timedelta, timezone
from pathlib import Path
from statistics import mean, median
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup


DATA_DIR = Path(__file__).resolve().parents[1] / "legacy_data"
MARKET_FILE = DATA_DIR / "dart_market.json"
HISTORY_FILE = DATA_DIR / "dart_history.json"
SETTINGS_FILE = DATA_DIR / "gold_settings.json"

DD373_BASE = "https://www.dd373.com"
DD373_DART_SERVERS = {
    "蓝蜗牛": "p9j4nb",
    "蘑菇仔": "vqppfq",
    "绿水灵": "hgccqt",
    "漂漂猪": "gsgchv",
    "小白兔": "1ghg70",
}
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36",
    "Accept-Language": "zh-CN,zh;q=0.9",
}

DARTS = {
    "2070002": {"name": "黑色利刃", "terms": ("黑色利刃", "木制飞镖", "木制飞标")},
    "2070003": {"name": "雪花镖", "terms": ("雪花镖", "雪花标", "雪花")},
    "2070004": {"name": "黑色刺", "terms": ("黑色刺", "黑刺")},
    "2070005": {"name": "金钱镖", "terms": ("金钱镖", "金钱标")},
    "2070006": {"name": "齿轮镖", "terms": ("齿轮镖", "齿轮标", "齿轮")},
    "2070007": {"name": "月牙镖", "terms": ("月牙镖", "月牙标", "月牙")},
    "2070008": {"name": "小雪球", "terms": ("小雪球", "雪球镖", "雪球标", "雪球")},
    "2070009": {"name": "木制陀螺", "terms": ("木制陀螺", "木质陀螺", "木陀螺", "陀螺镖", "陀螺标", "陀螺")},
    "2070010": {"name": "冰菱", "terms": ("冰菱镖", "冰菱标", "冰菱")},
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


def read_json(path: Path, fallback):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return fallback


def write_json(path: Path, payload) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    temporary.replace(path)


def collector_interval() -> int:
    settings = read_json(SETTINGS_FILE, {})
    try:
        return max(1, int(settings.get("intervalMinutes") or 10))
    except (TypeError, ValueError):
        return 10


def server_url(server_id: str) -> str:
    return f"{DD373_BASE}/s-063g3j-7ewcb6-{server_id}-0-0-0-urxs94-0u73pe-0-0-0-0-0-0-0-0.html"


def normalize_title(value: str) -> str:
    return re.sub(r"[\s,，。!！?？、·_+\-]+", "", str(value or "")).lower()


def classify_dart(title: str) -> tuple[str, str] | None:
    normalized = normalize_title(title)
    if "回旋镖" in normalized or "海星镖" in normalized:
        return None
    for dart_id, definition in DARTS.items():
        if any(normalize_title(term) in normalized for term in definition["terms"]):
            return dart_id, definition["name"]
    return None


def parse_listing(node, expected_server: str, source_url: str) -> dict | None:
    title_node = node.select_one("a.goods-list-title")
    price_node = node.select_one(".goods-price")
    type_node = node.select_one(".game-reputation")
    if not title_node or not price_node or not type_node or "飞镖" not in type_node.get_text(" ", strip=True):
        return None
    title = title_node.get_text(" ", strip=True)
    classified = classify_dart(title)
    if not classified:
        return None
    dart_id, dart_name = classified

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
        "id": f"dd-dart:{listing_id}",
        "dartId": dart_id,
        "dartName": dart_name,
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
        if server_id in href and "urxs94-0u73pe" in href:
            urls.add(href)
    return sorted(urls)[:5]


def collect_server(session: requests.Session, server: str, server_id: str) -> list[dict]:
    source_url = server_url(server_id)
    response = session.get(source_url, headers={**HEADERS, "Referer": DD373_BASE}, timeout=30)
    response.raise_for_status()
    response.encoding = "utf-8"
    soup = BeautifulSoup(response.text, "html.parser")
    pages = page_urls(soup, source_url, server_id)
    listings = []
    seen = set()
    for index, page_url in enumerate(pages):
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


def summarize(items: list[dict]) -> dict:
    prices = sorted(float(item["priceCny"]) for item in items if float(item.get("priceCny") or 0) > 0)
    if not prices:
        return {"count": 0}
    return {
        "count": len(items),
        "minPrice": round(prices[0], 2),
        "maxPrice": round(prices[-1], 2),
        "avgPrice": round(mean(prices), 2),
        "medianPrice": round(median(prices), 2),
    }


def build_groups(items: list[dict]) -> dict:
    grouped: dict[str, list[dict]] = {}
    for item in items:
        grouped.setdefault(f"{item['dartId']}|{item['area']} / {item['server']}", []).append(item)
    return {key: summarize(rows) for key, rows in grouped.items()}


def append_history(items: list[dict], sampled_at: str) -> list[dict]:
    rows = read_json(HISTORY_FILE, [])
    if not isinstance(rows, list):
        rows = []
    grouped = build_groups(items)
    for key, summary in grouped.items():
        dart_id, server_key = key.split("|", 1)
        rows.append({
            "sampledAt": sampled_at,
            "dartId": dart_id,
            "dartName": DARTS[dart_id]["name"],
            "serverKey": server_key,
            **summary,
        })
    rows = rows[-5000:]
    write_json(HISTORY_FILE, rows)
    return rows


def collect_once() -> dict:
    session = requests.Session()
    items = []
    errors = []
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
        "sampledAt": sampled_at,
        "items": sorted(items, key=lambda item: (item["dartId"], item["server"], item["priceCny"])),
        "summary": {"count": len(items)},
        "summaryByGroup": build_groups(items),
        "servers": [{"key": f"国服 / {server}", "name": server} for server in DD373_DART_SERVERS],
        "darts": [{"id": dart_id, "name": definition["name"]} for dart_id, definition in DARTS.items()],
        "recentHistory": history[-1200:],
        "errors": errors,
    }
    write_json(MARKET_FILE, payload)
    return payload


def load_market_payload() -> dict:
    payload = read_json(MARKET_FILE, {"items": [], "summary": {"count": 0}})
    if not isinstance(payload, dict):
        payload = {"items": [], "summary": {"count": 0}}
    payload["collector"] = dict(COLLECTOR_STATE)
    payload.setdefault("servers", [{"key": f"国服 / {server}", "name": server} for server in DD373_DART_SERVERS])
    payload.setdefault("darts", [{"id": dart_id, "name": definition["name"]} for dart_id, definition in DARTS.items()])
    return payload


def _collector_loop() -> None:
    while True:
        interval = collector_interval()
        now = datetime.now(timezone.utc)
        with _collector_lock:
            COLLECTOR_STATE["running"] = True
            COLLECTOR_STATE["lastAttemptAt"] = now.isoformat()
            COLLECTOR_STATE["nextRunAt"] = (now + timedelta(minutes=interval)).isoformat()
            COLLECTOR_STATE["lastError"] = ""
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


def start_dart_collector() -> None:
    global _collector_started
    with _collector_lock:
        if _collector_started:
            return
        _collector_started = True
    threading.Thread(target=_collector_loop, daemon=True, name="dart-market-collector").start()
