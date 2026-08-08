from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.database import Base, SessionLocal, engine  # noqa: E402
from app.models import Category, HomeSlot, Item, MarketServer, Monster, MonsterDrop, Post, User  # noqa: E402
from app.security import hash_secret  # noqa: E402


ITEM_CATEGORY_ORDER = ["药水", "卷轴", "飞镖", "特殊"]
EQUIPMENT_CATEGORY_ORDER = ["武器", "帽子", "上衣", "裤裙", "鞋子", "手套", "套服", "披风", "盾牌", "耳环", "饰品", "特殊"]


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def normalize_item_category(row: dict) -> tuple[str, str]:
    library = str(row.get("library") or "").strip() or ("装备库" if row.get("category") == "装备" else "物品库")
    section = str(row.get("section") or "").strip()
    kind = str(row.get("kind") or "").strip()
    sub_category = str(row.get("subCategory") or "").strip()

    if library == "装备库":
      category = section if section in EQUIPMENT_CATEGORY_ORDER else sub_category or kind or "特殊"
      if category not in EQUIPMENT_CATEGORY_ORDER:
          category = "特殊"
      return category, sub_category or category

    marker = f"{section} {kind} {sub_category}"
    if "飞镖" in marker:
        return "飞镖", sub_category or "飞镖"
    if "卷轴" in marker:
        return "卷轴", sub_category or "卷轴"
    if "药水" in marker or kind == "药水":
        return "药水", sub_category or "药水"
    return "特殊", sub_category or section or kind or "特殊"


def stat_value(row: dict, *keys: str, default="") -> str:
    stats = row.get("stats") if isinstance(row.get("stats"), list) else []
    for stat in stats:
        if str(stat.get("key")) in keys:
            return str(stat.get("value") or default)
    return str(default)


def import_all(legacy_root: Path) -> dict[str, int]:
    items_path = legacy_root / "data" / "items.json"
    monsters_path = legacy_root / "data" / "monsters.json"
    site_config_path = legacy_root / "data" / "site_config.json"
    if not items_path.exists() or not monsters_path.exists():
        raise FileNotFoundError(f"旧项目数据不存在：{legacy_root}")

    legacy_items = read_json(items_path)
    legacy_monsters = read_json(monsters_path)
    site_config = read_json(site_config_path) if site_config_path.exists() else {}

    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        admin = User(
            username="admin",
            password_hash=hash_secret("maple2026"),
            display_name="管理员",
            role="admin",
            recovery_question="管理员初始化问题",
            recovery_answer_hash=hash_secret("maple2026"),
        )
        db.add(admin)

        for index, name in enumerate(ITEM_CATEGORY_ORDER):
            db.add(Category(scope="item", name=name, sort_order=index, is_system=True))
        for index, name in enumerate(EQUIPMENT_CATEGORY_ORDER):
            db.add(Category(scope="equipment", name=name, sort_order=index, is_system=True))
        for index, name in enumerate(["玩家讨论", "行情观察", "版本更新"]):
            db.add(Category(scope="post", name=name, sort_order=index, is_system=True))
        for index, name in enumerate(["视频攻略", "任务攻略", "职业养成", "升级路线"]):
            db.add(Category(scope="guide", name=name, sort_order=index, is_system=True))

        item_by_external_id: dict[str, Item] = {}
        for row in legacy_items:
            category, subcategory = normalize_item_category(row)
            level_text = stat_value(row, "reqLevel", "req_level", default="0")
            try:
                level_required = int(float(level_text))
            except ValueError:
                level_required = 0
            job = stat_value(row, "req_job_label", "job", default="")
            item = Item(
                external_id=str(row.get("id") or row.get("code") or "").strip(),
                library=str(row.get("library") or ("装备库" if row.get("category") == "装备" else "物品库")).strip(),
                category=category,
                subcategory=subcategory,
                name=str(row.get("name") or row.get("nameEn") or "未命名物品").strip(),
                icon_url=str(row.get("img") or "").strip(),
                level_required=level_required,
                job=job,
                description=str(row.get("description") or "").strip(),
                tags=",".join(value for value in [str(row.get("kind") or ""), str(row.get("tier") or ""), str(row.get("statType") or "")] if value),
            )
            db.add(item)
            item_by_external_id[item.external_id] = item

        db.flush()

        for row in legacy_monsters:
            monster = Monster(
                external_id=str(row.get("id") or row.get("sourceId") or "").strip(),
                name=str(row.get("name") or row.get("nameEn") or "未命名怪物").strip(),
                level=int(row.get("level") or 0),
                hp=int(row.get("hp") or 0),
                exp=int(row.get("exp") or 0),
                area=str(row.get("area") or "").strip(),
                map_name=str(row.get("map") or "").strip(),
                icon_url=str(row.get("img") or "").strip(),
                attributes=",".join(str(value) for value in (row.get("attributes") or [])),
                description=str(row.get("density") or "").strip(),
            )
            db.add(monster)
            db.flush()
            for group, drops in (row.get("drops") or {}).items():
                for drop in drops or []:
                    external_id = str(drop.get("id") if isinstance(drop, dict) else drop).strip()
                    item = item_by_external_id.get(external_id)
                    if item:
                        db.add(MonsterDrop(monster_id=monster.id, item_id=item.id, drop_group=str(group), note=str(drop.get("source") or "")[:160]))

        for server_index, server_name in enumerate(["一区", "二区"]):
            db.add(MarketServer(area="维多利亚", name=server_name, is_home_visible=server_index == 0))

        for index, config in enumerate(site_config.get("homeRecommendations") or []):
            db.add(
                HomeSlot(
                    slot_key=f"home-watch-{index + 1}",
                    title=str(config.get("badge") or "观察中"),
                    subtitle=str(config.get("subtitle") or ""),
                    target_type="item",
                    target_id=str(config.get("itemId") or ""),
                    sort_order=int(config.get("position") or index + 1),
                )
            )

        db.flush()
        db.add(
            Post(
                channel="guide",
                title="开荒攻略内容将在这里沉淀",
                summary="旧数据已迁入数据库，下一步将接入后台发布与前台卡片展示。",
                content="后台发布后，开荒页会自动展示卡片。",
                author_id=admin.id,
            )
        )
        db.commit()

        return {
            "items": db.query(Item).count(),
            "monsters": db.query(Monster).count(),
            "drops": db.query(MonsterDrop).count(),
            "categories": db.query(Category).count(),
            "homeSlots": db.query(HomeSlot).count(),
        }
    finally:
        db.close()


def main() -> None:
    parser = argparse.ArgumentParser(description="Import legacy Maple Terminal JSON data into V2 database.")
    parser.add_argument(
        "--legacy-root",
        default=r"C:\Users\Administrator\Documents\Codex\2026-07-16\new-chat\work\maple-terminal-demo",
        help="旧原型项目根目录，只读取 data/*.json，不会写入。",
    )
    args = parser.parse_args()
    summary = import_all(Path(args.legacy_root))
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
