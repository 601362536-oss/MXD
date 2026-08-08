from __future__ import annotations

from sqlalchemy.orm import Session

from .models import Category, Item, MarketQuote, MarketServer, Monster, Post, User
from .security import hash_secret


def seed_database(db: Session) -> None:
    if not db.query(User).filter(User.username == "admin").first():
        admin = User(
            username="admin",
            password_hash=hash_secret("maple2026"),
            display_name="管理员",
            role="admin",
            recovery_question="管理员初始化问题",
            recovery_answer_hash=hash_secret("maple2026"),
        )
        db.add(admin)

    default_categories = [
        ("item", "药水"),
        ("item", "卷轴"),
        ("item", "飞镖"),
        ("item", "特殊"),
        ("equipment", "武器"),
        ("equipment", "帽子"),
        ("equipment", "上衣"),
        ("equipment", "裤裙"),
        ("equipment", "鞋子"),
        ("equipment", "手套"),
        ("equipment", "披风"),
        ("equipment", "盾牌"),
        ("equipment", "饰品"),
        ("post", "玩家讨论"),
        ("guide", "视频攻略"),
    ]
    for index, (scope, name) in enumerate(default_categories):
        exists = db.query(Category).filter(Category.scope == scope, Category.name == name).first()
        if not exists:
            db.add(Category(scope=scope, name=name, sort_order=index, is_system=True))

    if not db.query(Item).first():
        db.add_all(
            [
                Item(library="物品库", category="飞镖", subcategory="飞镖", name="金钱镖", tags="飞侠,投掷"),
                Item(library="物品库", category="飞镖", subcategory="飞镖", name="月牙镖", tags="飞侠,投掷"),
                Item(library="物品库", category="卷轴", subcategory="手套", name="手套攻击卷轴 60%", tags="卷轴,热门观察"),
                Item(library="装备库", category="武器", subcategory="短刀", name="枫叶刃", level_required=35, job="飞侠"),
            ]
        )

    if not db.query(Monster).first():
        db.add_all(
            [
                Monster(name="赤龙", level=60, hp=12000, exp=240, area="神秘岛", map_name="龙之谷"),
                Monster(name="蝙蝠怪", level=35, hp=2800, exp=90, area="林中之城", map_name="地下寺院"),
            ]
        )

    if not db.query(MarketServer).first():
        db.add_all(
            [
                MarketServer(area="维多利亚", name="一区", is_home_visible=True),
                MarketServer(area="维多利亚", name="二区", is_home_visible=False),
            ]
        )
        db.flush()

    if not db.query(MarketQuote).first():
        servers = db.query(MarketServer).order_by(MarketServer.id).all()
        if servers:
            db.add_all(
                [
                    MarketQuote(server_id=servers[0].id, price_per_yi=8.8, source="初始化样例"),
                    MarketQuote(server_id=servers[0].id, price_per_yi=8.6, source="初始化样例"),
                    MarketQuote(server_id=servers[0].id, price_per_yi=8.9, source="初始化样例"),
                ]
            )

    db.flush()
    admin = db.query(User).filter(User.username == "admin").first()
    if admin and not db.query(Post).first():
        db.add(
            Post(
                channel="guide",
                title="开荒攻略内容将在这里沉淀",
                summary="这是新系统的攻略卡片样式占位，后续从后台发布真实内容。",
                content="后台发布后，开荒页会自动展示卡片。",
                author_id=admin.id,
            )
        )

    db.commit()
