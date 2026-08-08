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
MARKET_FILE = DATA_DIR / "gold_market.json"
HISTORY_FILE = DATA_DIR / "gold_history.json"
SETTINGS_FILE = DATA_DIR / "gold_settings.json"

GMMSJ_CLASSIC_URL = "https://www.gmmsj.com/dy/791001093.shtml?refer=history"
DD373_CLASSIC_SERVERS = {
    "蓝蜗牛": "https://www.dd373.com/s-063g3j-c-et9e1b-7ewcb6-p9j4nb.html",
    "蘑菇仔": "https://www.dd373.com/s-063g3j-c-et9e1b-7ewcb6-vqppfq.html",
    "绿水灵": "https://www.dd373.com/s-063g3j-c-et9e1b-7ewcb6-hgccqt.html",
    "漂漂猪": "https://www.dd373.com/s-063g3j-c-et9e1b-7ewcb6-gsgchv.html",
    "小白兔": "https://www.dd373.com/s-063g3j-c-et9e1b-7ewcb6-1ghg70.html",
}
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36",
    "Accept-Language": "zh-CN,zh;q=0.9",
}
DEFAULT_SETTINGS = {
    "marketStatus": "开盘中",
    "intervalMinutes": 10,
    "minGoldYi": 10,
    "deviationPercent": 35,
    "homeServerKey": "国服 / 蓝蜗牛",
}

COLLECTOR_STATE = {
    "running": False,
    "lastAttemptAt": "",
    "lastSuccessAt": "",
    "nextRunAt": "",
    "lastError": "",
    "sources": ["G买卖", "DD373"],
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


def load_settings() -> dict:
    raw = read_json(SETTINGS_FILE, {})
    return {**DEFAULT_SETTINGS, **(raw if isinstance(raw, dict) else {})}


def infer_edition(item: dict) -> str:
    explicit = str(item.get("edition") or item.get("version") or "").strip()
    if explicit in {"正式服", "怀旧服"}:
        return explicit
    haystack = f"{item.get('area', '')} {item.get('server', '')} {item.get('title', '')}"
    return "怀旧服" if "怀旧" in haystack else "正式服"


def normalize_listing(item: dict) -> dict:
    edition = infer_edition(item)
    return {
        **item,
        "edition": edition,
        "unit": str(item.get("unit") or ("万金" if edition == "怀旧服" else "亿金")),
    }


def parse_amount_and_price(text: str) -> tuple[float, float] | None:
    match = re.search(r"【\s*(\d+(?:\.\d+)?)\s*(万金|亿金)\s*=\s*(\d+(?:\.\d+)?)\s*元\s*】", text)
    if not match:
        return None
    return float(match.group(1)), float(match.group(3))


def parse_gmmsj_listing(node) -> dict | None:
    text = node.get_text("\n", strip=True)
    amount_and_price = parse_amount_and_price(text)
    if not amount_and_price:
        return None
    amount, price_cny = amount_and_price

    lines = [line.strip() for line in text.splitlines() if line.strip()]
    server_line = next((line for line in lines if "冒险岛怀旧服-" in line), "")
    if not server_line:
        return None
    server = server_line.split("-")[-1].strip()
    if server not in DD373_CLASSIC_SERVERS:
        return None

    href_node = node.select_one("a.info[href], a.media-left[href]")
    href = urljoin(GMMSJ_CLASSIC_URL, href_node.get("href", "")) if href_node else GMMSJ_CLASSIC_URL
    listing_id = str(node.get("data-bookid") or href.rsplit("/", 1)[-1].replace(".shtml", ""))
    numeric_lines = [line for line in lines if re.fullmatch(r"\d+(?:\.\d+)?", line)]
    inventory = int(float(numeric_lines[-1])) if numeric_lines else 0
    return {
        "id": f"gm-classic:{listing_id}",
        "title": next((line for line in lines if "万金=" in line), f"{server} {amount:g}万金"),
        "edition": "怀旧服",
        "area": "国服",
        "server": server,
        "goldYi": amount,
        "unit": "万金",
        "priceCny": round(price_cny, 2),
        "pricePerYi": round(price_cny / amount, 4),
        "gameCoinPerCnyYi": round(amount / price_cny, 4),
        "inventory": inventory,
        "url": href or GMMSJ_CLASSIC_URL,
        "source": "G买卖",
    }


def collect_gmmsj_classic(session: requests.Session) -> list[dict]:
    response = session.get(GMMSJ_CLASSIC_URL, headers={**HEADERS, "Referer": GMMSJ_CLASSIC_URL}, timeout=30)
    response.raise_for_status()
    response.encoding = "utf-8"
    soup = BeautifulSoup(response.text, "html.parser")
    listings = []
    seen = set()
    for node in soup.select("#goods-list-jsp > li.media"):
        item = parse_gmmsj_listing(node)
        if item and item["id"] not in seen:
            listings.append(item)
            seen.add(item["id"])
    return listings


def parse_dd373_listing(node, server: str, source_url: str) -> dict | None:
    text = node.get_text(" ", strip=True)
    if "游戏币" not in text or "国服" not in text:
        return None
    amount_input = node.select_one("input.goods-num")
    if not amount_input:
        return None
    try:
        amount = float(amount_input.get("value") or amount_input.get("min") or 0)
        price_per_unit = float(amount_input.get("singleprice") or 0)
    except (TypeError, ValueError):
        return None
    if amount <= 0 or price_per_unit <= 0:
        return None

    action = node.select_one(".shop-btn-group")
    action_id = str(action.get("id") or "") if action else ""
    order_link = node.select_one("a.im-buy-btn[href]")
    order_href = order_link.get("href", "") if order_link else ""
    listing_id = action_id.removeprefix("buyButton") or re.sub(r"\W+", "-", order_href)
    inventory = float(amount_input.get("max") or amount)
    return {
        "id": f"dd-classic:{listing_id}",
        "title": f"{server} {amount:g}万金",
        "edition": "怀旧服",
        "area": "国服",
        "server": server,
        "goldYi": amount,
        "unit": "万金",
        "priceCny": round(amount * price_per_unit, 2),
        "pricePerYi": round(price_per_unit, 4),
        "gameCoinPerCnyYi": round(1 / price_per_unit, 4),
        "inventory": int(inventory) if inventory.is_integer() else inventory,
        "url": source_url,
        "source": "DD373",
    }


def collect_dd373_classic(session: requests.Session) -> list[dict]:
    listings = []
    seen = set()
    for server, source_url in DD373_CLASSIC_SERVERS.items():
        response = session.get(source_url, headers={**HEADERS, "Referer": "https://www.dd373.com/"}, timeout=30)
        response.raise_for_status()
        response.encoding = "utf-8"
        soup = BeautifulSoup(response.text, "html.parser")
        for node in soup.select(".goods-list-item"):
            item = parse_dd373_listing(node, server, source_url)
            if item and item["id"] not in seen:
                listings.append(item)
                seen.add(item["id"])
    return listings


def summarize(items: list[dict]) -> dict:
    prices = [float(item.get("pricePerYi") or 0) for item in items if float(item.get("pricePerYi") or 0) > 0]
    if not prices:
        return {"count": 0}
    return {
        "count": len(items),
        "minPricePerYi": round(min(prices), 4),
        "maxPricePerYi": round(max(prices), 4),
        "avgPricePerYi": round(mean(prices), 4),
        "medianPricePerYi": round(median(prices), 4),
        "totalInventory": sum(float(item.get("inventory") or 0) for item in items),
    }


def server_key(item: dict) -> str:
    return f"{item.get('area') or '未知区服'} / {item.get('server') or '未知服务器'}"


def effective_items(items: list[dict], settings: dict) -> list[dict]:
    minimum = float(settings.get("minGoldYi") or 10)
    deviation = float(settings.get("deviationPercent") or 35) / 100
    candidates = [item for item in items if float(item.get("goldYi") or 0) >= minimum and item.get("url")]
    item_summary = summarize(candidates)
    median_price = float(item_summary.get("medianPricePerYi") or 0)
    if not median_price:
        return candidates
    floor = median_price * (1 - deviation)
    return [item for item in candidates if float(item.get("pricePerYi") or 0) >= floor]


def build_history_snapshots(items: list[dict], sampled_at: str, settings: dict) -> list[dict]:
    groups: dict[str, list[dict]] = {}
    for item in items:
        groups.setdefault(server_key(item), []).append(item)

    snapshots = []
    for key, group in groups.items():
        valid_group = effective_items(group, settings)
        item_summary = summarize(valid_group)
        if not item_summary.get("count"):
            continue
        best = min(valid_group, key=lambda item: float(item.get("pricePerYi") or 999999))
        snapshots.append({
            "sampledAt": sampled_at,
            "serverKey": key,
            "edition": infer_edition(best),
            "unit": best.get("unit", "亿金"),
            "area": best.get("area", ""),
            "server": best.get("server", ""),
            "count": item_summary["count"],
            "bestListingId": best.get("id", ""),
            "bestPricePerYi": best.get("pricePerYi", 0),
            "bestGoldYi": best.get("goldYi", 0),
            "bestInventory": best.get("inventory", 0),
            "bestUrl": best.get("url", ""),
            "bestSource": best.get("source", ""),
            "minPricePerYi": item_summary["minPricePerYi"],
            "maxPricePerYi": item_summary["maxPricePerYi"],
            "avgPricePerYi": item_summary["avgPricePerYi"],
            "medianPricePerYi": item_summary["medianPricePerYi"],
            "totalInventory": item_summary["totalInventory"],
            "filteredCount": len(group) - len(valid_group),
        })
    return snapshots


def collect_once() -> dict:
    settings = load_settings()
    session = requests.Session()
    classic_items = collect_gmmsj_classic(session) + collect_dd373_classic(session)
    if not classic_items:
        raise RuntimeError("两个怀旧服来源都没有返回有效游戏币报价")

    previous = read_json(MARKET_FILE, {})
    previous_items = previous.get("items", []) if isinstance(previous, dict) else []
    formal_items = [normalize_listing(item) for item in previous_items if infer_edition(item) == "正式服"]
    all_items = formal_items + classic_items
    sampled_at = datetime.now(timezone.utc).isoformat()

    history = read_json(HISTORY_FILE, [])
    if not isinstance(history, list):
        history = []
    history.extend(build_history_snapshots(classic_items, sampled_at, settings))
    history = history[-5000:]
    write_json(HISTORY_FILE, history)

    history_by_server: dict[str, int] = {}
    for row in history:
        key = str(row.get("serverKey") or "")
        if key:
            history_by_server[key] = history_by_server.get(key, 0) + 1

    payload = {
        "source": "multi-source",
        "sourceName": "G买卖 + DD373",
        "sourceUrl": GMMSJ_CLASSIC_URL,
        "sampledAt": sampled_at,
        "items": all_items,
        "summary": {"count": len(all_items)},
        "settings": settings,
        "historyCount": len(history),
        "historyByServer": history_by_server,
        "recentHistory": history[-3000:],
        "editions": [
            {"key": "正式服", "label": "正式服"},
            {"key": "怀旧服", "label": "怀旧服"},
        ],
        "classicServers": list(DD373_CLASSIC_SERVERS),
    }
    write_json(MARKET_FILE, payload)
    return payload


def load_market_payload() -> dict:
    payload = read_json(MARKET_FILE, {"items": [], "summary": {"count": 0}})
    if not isinstance(payload, dict):
        payload = {"items": [], "summary": {"count": 0}}
    payload["items"] = [normalize_listing(item) for item in payload.get("items", [])]
    history = read_json(HISTORY_FILE, payload.get("recentHistory", []))
    if not isinstance(history, list):
        history = []
    payload["recentHistory"] = history[-3000:]
    payload["historyCount"] = len(history)
    counts: dict[str, int] = {}
    for row in history:
        key = str(row.get("serverKey") or "")
        if key:
            counts[key] = counts.get(key, 0) + 1
    payload["historyByServer"] = counts
    payload["settings"] = {**payload.get("settings", {}), **load_settings()}
    payload["collector"] = dict(COLLECTOR_STATE)
    return payload


def _collector_loop() -> None:
    while True:
        settings = load_settings()
        interval = max(1, int(settings.get("intervalMinutes") or 10))
        now = datetime.now(timezone.utc)
        with _collector_lock:
            COLLECTOR_STATE["lastAttemptAt"] = now.isoformat()
            COLLECTOR_STATE["nextRunAt"] = (now + timedelta(minutes=interval)).isoformat()
            COLLECTOR_STATE["lastError"] = ""
        if settings.get("marketStatus") == "开盘中":
            with _collector_lock:
                COLLECTOR_STATE["running"] = True
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
        else:
            with _collector_lock:
                COLLECTOR_STATE["lastError"] = f"行情状态为“{settings.get('marketStatus')}”，采集已暂停"
        threading.Event().wait(interval * 60)


def start_gold_collector() -> None:
    global _collector_started
    with _collector_lock:
        if _collector_started:
            return
        _collector_started = True
    threading.Thread(target=_collector_loop, daemon=True, name="gold-market-collector").start()
