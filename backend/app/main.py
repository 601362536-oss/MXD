from __future__ import annotations

import json
import secrets
from datetime import datetime
from pathlib import Path
from typing import Annotated

from fastapi import Depends, FastAPI, Header, HTTPException, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from .dart_collector import load_market_payload as load_dart_market_payload, start_dart_collector
from .gold_collector import load_market_payload, start_gold_collector
from .scroll_collector import load_market_payload as load_scroll_market_payload, start_scroll_collector
from .models import Category, Comment, HomeSlot, Item, MarketQuote, MarketServer, Monster, MonsterDrop, Post, User
from .schemas import (
    AuthOut,
    CategoryIn,
    CategoryOut,
    CommentIn,
    CommentOut,
    DropIn,
    DropOut,
    HomeSlotIn,
    HomeSlotOut,
    ItemIn,
    ItemListOut,
    ItemOut,
    LoginIn,
    MarketQuoteIn,
    MarketQuoteOut,
    MarketServerIn,
    MarketServerOut,
    MonsterIn,
    MonsterListOut,
    MonsterOut,
    PostDetailOut,
    PostIn,
    PostOut,
    ProfileIn,
    RegisterIn,
    UserOut,
)
from .security import hash_secret, public_token, verify_secret
from .seed import seed_database


app = FastAPI(title="Maple Terminal API", version="2.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TOKENS: dict[str, int] = {}
COOKIE_TOKENS: dict[str, int] = {}
REGISTRATION_OPEN = False
INVITE_CODE = "345915403"
LEGACY_DATA_DIR = Path(__file__).resolve().parents[1] / "legacy_data"


@app.on_event("startup")
def start_background_services() -> None:
    start_gold_collector()
    start_dart_collector()
    start_scroll_collector()


def legacy_read(name: str, fallback):
    path = LEGACY_DATA_DIR / name
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return fallback


def legacy_write(name: str, payload) -> None:
    LEGACY_DATA_DIR.mkdir(parents=True, exist_ok=True)
    (LEGACY_DATA_DIR / name).write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def normalize_legacy_news(item: dict) -> dict:
    now = datetime.now().strftime("%m-%d")
    return {
        "id": str(item.get("id") or secrets.token_hex(8)),
        "title": str(item.get("title") or "未命名内容"),
        "summary": str(item.get("summary") or ""),
        "link": str(item.get("link") or ""),
        "source": str(item.get("source") or item.get("author") or "枫岛玩家"),
        "kind": str(item.get("kind") or ("开荒攻略" if item.get("channel") == "guide" else "玩家交流")),
        "channel": str(item.get("channel") or "community"),
        "date": str(item.get("date") or now),
        "cover": str(item.get("cover") or item.get("coverUrl") or ""),
        "status": str(item.get("status") or "已发布"),
        "content": str(item.get("content") or ""),
        "mediaType": str(item.get("mediaType") or ("视频攻略" if item.get("videoUrl") else "图文内容")),
        "videoUrl": str(item.get("videoUrl") or ""),
        "author": str(item.get("author") or item.get("source") or "枫岛玩家"),
        "authorRole": str(item.get("authorRole") or "player"),
        "likes": int(item.get("likes") or 0),
        "views": int(item.get("views") or 0),
        "tags": item.get("tags") if isinstance(item.get("tags"), list) else [],
        "slots": item.get("slots") if isinstance(item.get("slots"), list) else [],
        "targets": item.get("targets") if isinstance(item.get("targets"), list) else [],
        "comments": item.get("comments") if isinstance(item.get("comments"), list) else [],
    }


def public_legacy_user(user: User | None) -> dict:
    if not user:
        return {
            "ok": True,
            "authenticated": False,
            "username": "",
            "displayName": "",
            "role": "guest",
            "roles": [],
            "avatarColor": "#0b9ed5",
            "avatarUrl": "",
            "bio": "",
            "admin": False,
            "moderator": False,
        }
    roles = ["admin", "moderator", "author", "player"] if user.role == "admin" else ["player"]
    return {
        "ok": True,
        "authenticated": True,
        "username": user.username,
        "displayName": user.display_name,
        "role": user.role,
        "roles": roles,
        "avatarColor": "#0b9ed5",
        "avatarUrl": user.avatar_url,
        "bio": user.bio,
        "admin": user.role == "admin",
        "moderator": user.role == "admin",
    }


def cookie_user(request: Request, db: Session) -> User | None:
    token = request.cookies.get("maple_user", "")
    user_id = COOKIE_TOKENS.get(token) or TOKENS.get(token)
    return db.get(User, user_id) if user_id else None


def to_user_out(user: User) -> UserOut:
    return UserOut(
        id=user.id,
        username=user.username,
        displayName=user.display_name,
        role=user.role,
        avatarUrl=user.avatar_url,
        bio=user.bio,
    )


def current_user(
    db: Annotated[Session, Depends(get_db)],
    authorization: Annotated[str | None, Header()] = None,
) -> User:
    token = (authorization or "").replace("Bearer ", "", 1).strip()
    user_id = TOKENS.get(token)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="请先登录")
    user = db.get(User, user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="登录已失效")
    return user


def admin_user(user: Annotated[User, Depends(current_user)]) -> User:
    if user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="需要管理员权限")
    return user


def to_category_out(row: Category) -> CategoryOut:
    return CategoryOut(id=row.id, scope=row.scope, name=row.name, sortOrder=row.sort_order)


def to_item_out(row: Item) -> ItemOut:
    return ItemOut(
        id=row.id,
        library=row.library,
        category=row.category,
        subcategory=row.subcategory,
        name=row.name,
        iconUrl=row.icon_url,
        levelRequired=row.level_required,
        job=row.job,
        tags=row.tags,
    )


def to_monster_out(row: Monster) -> MonsterOut:
    return MonsterOut(
        id=row.id,
        name=row.name,
        level=row.level,
        hp=row.hp,
        exp=row.exp,
        area=row.area,
        mapName=row.map_name,
        iconUrl=row.icon_url,
    )


def to_drop_out(row: MonsterDrop) -> DropOut:
    return DropOut(
        id=row.item.id,
        name=row.item.name,
        library=row.item.library,
        category=row.item.category,
        iconUrl=row.item.icon_url,
        dropGroup=row.drop_group,
        note=row.note,
    )


def to_post_out(row: Post) -> PostOut:
    return PostOut(
        id=row.id,
        channel=row.channel,
        title=row.title,
        summary=row.summary,
        coverUrl=row.cover_url,
        videoUrl=row.video_url,
        authorName=row.author.display_name if row.author else "玩家",
        likesCount=row.likes_count,
        commentsCount=len([comment for comment in row.comments if not comment.is_deleted]),
        createdAt=row.created_at,
    )


def to_post_detail_out(row: Post) -> PostDetailOut:
    return PostDetailOut(**to_post_out(row).model_dump(), content=row.content)


def to_comment_out(row: Comment) -> CommentOut:
    return CommentOut(
        id=row.id,
        postId=row.post_id,
        authorName=row.author.display_name if row.author else "玩家",
        avatarUrl=row.author.avatar_url if row.author else "",
        content=row.content,
        createdAt=row.created_at,
    )


def to_market_server_out(row: MarketServer) -> MarketServerOut:
    return MarketServerOut(id=row.id, area=row.area, name=row.name, isHomeVisible=row.is_home_visible)


def to_market_quote_out(row: MarketQuote) -> MarketQuoteOut:
    return MarketQuoteOut(
        id=row.id,
        serverId=row.server_id,
        serverName=row.server.name if row.server else "",
        area=row.server.area if row.server else "",
        pricePerYi=row.price_per_yi,
        source=row.source,
        createdAt=row.created_at,
    )


def to_home_slot_out(row: HomeSlot) -> HomeSlotOut:
    return HomeSlotOut(
        id=row.id,
        slotKey=row.slot_key,
        title=row.title,
        subtitle=row.subtitle,
        targetType=row.target_type,
        targetId=row.target_id,
        sortOrder=row.sort_order,
    )


@app.on_event("startup")
def startup() -> None:
    Base.metadata.create_all(bind=engine)
    db = next(get_db())
    try:
        seed_database(db)
    finally:
        db.close()


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"ok": "true", "service": "maple-terminal-api"}


@app.post("/api/auth/register", response_model=AuthOut)
def register(payload: RegisterIn, db: Annotated[Session, Depends(get_db)]) -> AuthOut:
    if not REGISTRATION_OPEN and payload.inviteCode != INVITE_CODE:
        raise HTTPException(status_code=403, detail="内测版本暂时不开放注册。")
    existing = db.query(User).filter(User.username == payload.username).first()
    if existing:
        raise HTTPException(status_code=409, detail="账号已存在")
    user = User(
        username=payload.username,
        password_hash=hash_secret(payload.password),
        display_name=payload.displayName,
        role="player",
        recovery_question=payload.recoveryQuestion,
        recovery_answer_hash=hash_secret(payload.recoveryAnswer.strip().lower()),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = public_token()
    TOKENS[token] = user.id
    return AuthOut(token=token, user=to_user_out(user))


@app.post("/api/auth/login", response_model=AuthOut)
def login(payload: LoginIn, db: Annotated[Session, Depends(get_db)]) -> AuthOut:
    user = db.query(User).filter(User.username == payload.username).first()
    if not user or not verify_secret(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="账号或密码不正确")
    token = public_token()
    TOKENS[token] = user.id
    return AuthOut(token=token, user=to_user_out(user))


@app.post("/api/login")
@app.post("/api/admin/login")
def legacy_login(payload: LoginIn, response: Response, db: Annotated[Session, Depends(get_db)]) -> dict:
    user = db.query(User).filter(User.username == payload.username).first()
    if not user or not verify_secret(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="账号或密码不正确。")
    token = public_token()
    COOKIE_TOKENS[token] = user.id
    TOKENS[token] = user.id
    response.set_cookie("maple_user", token, httponly=True, samesite="lax", path="/")
    return public_legacy_user(user)


@app.post("/api/register")
def legacy_register(payload: RegisterIn, response: Response, db: Annotated[Session, Depends(get_db)]) -> dict:
    if not REGISTRATION_OPEN and payload.inviteCode != INVITE_CODE:
        raise HTTPException(status_code=403, detail="内测版本暂时不开放注册。")
    existing = db.query(User).filter(User.username == payload.username).first()
    if existing:
        raise HTTPException(status_code=409, detail="这个账号已经存在。")
    user = User(
        username=payload.username,
        password_hash=hash_secret(payload.password),
        display_name=payload.displayName,
        role="player",
        recovery_question=payload.recoveryQuestion,
        recovery_answer_hash=hash_secret(payload.recoveryAnswer.strip().lower()),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = public_token()
    COOKIE_TOKENS[token] = user.id
    TOKENS[token] = user.id
    response.set_cookie("maple_user", token, httponly=True, samesite="lax", path="/")
    return public_legacy_user(user)


@app.post("/api/logout")
@app.post("/api/admin/logout")
def legacy_logout(request: Request, response: Response) -> dict[str, bool]:
    token = request.cookies.get("maple_user", "")
    if token:
        COOKIE_TOKENS.pop(token, None)
        TOKENS.pop(token, None)
    response.delete_cookie("maple_user", path="/")
    return {"ok": True}


@app.get("/api/me")
@app.get("/api/admin/me")
def legacy_me(request: Request, db: Annotated[Session, Depends(get_db)]) -> dict:
    return public_legacy_user(cookie_user(request, db))


@app.post("/api/profile")
def legacy_profile(payload: ProfileIn, request: Request, db: Annotated[Session, Depends(get_db)]) -> dict:
    user = cookie_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="请先登录。")
    user.display_name = payload.displayName
    user.avatar_url = payload.avatarUrl
    user.bio = payload.bio
    db.commit()
    db.refresh(user)
    return public_legacy_user(user)


@app.post("/api/recover-password")
def legacy_recover_password(payload: dict, db: Annotated[Session, Depends(get_db)]) -> dict[str, bool]:
    username = str(payload.get("username") or "").strip()
    password = str(payload.get("password") or "").strip()
    answer = str(payload.get("recoveryAnswer") or "").strip().lower()
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="没有找到这个账号。")
    if not verify_secret(answer, user.recovery_answer_hash):
        raise HTTPException(status_code=403, detail="找回问题或答案不正确。")
    if len(password) < 6:
        raise HTTPException(status_code=400, detail="新密码至少 6 位。")
    user.password_hash = hash_secret(password)
    db.commit()
    return {"ok": True}


@app.get("/api/auth/me", response_model=UserOut)
def me(user: Annotated[User, Depends(current_user)]) -> UserOut:
    return to_user_out(user)


@app.put("/api/auth/me", response_model=UserOut)
def update_me(payload: ProfileIn, user: Annotated[User, Depends(current_user)], db: Annotated[Session, Depends(get_db)]) -> UserOut:
    user.display_name = payload.displayName
    user.avatar_url = payload.avatarUrl
    user.bio = payload.bio
    db.commit()
    db.refresh(user)
    return to_user_out(user)


@app.get("/api/categories", response_model=list[CategoryOut])
def categories(scope: str = "", db: Session = Depends(get_db)) -> list[CategoryOut]:
    query = db.query(Category)
    if scope:
        query = query.filter(Category.scope == scope)
    rows = query.order_by(Category.scope, Category.sort_order, Category.id).all()
    return [to_category_out(row) for row in rows]


@app.get("/api/site-config")
def legacy_site_config() -> dict:
    return legacy_read(
        "site_config.json",
        {
            "marketWatchlist": [],
            "homeRecommendations": [],
            "homeRecommendationSortMode": "volatility",
            "itemTaxonomy": {
                "libraries": ["物品库", "装备库"],
                "itemCategories": ["消耗品", "设置", "其他", "特殊"],
                "equipmentCategories": ["装备", "特殊"],
                "kinds": ["行情观察", "开荒常用", "热门", "高等级", "任务", "其他"],
            },
        },
    )


@app.get("/api/gold-market")
def legacy_gold_market() -> dict:
    return load_market_payload()


@app.get("/api/dart-market")
def dart_market() -> dict:
    return load_dart_market_payload()


@app.get("/api/scroll-market")
def scroll_market() -> dict:
    return load_scroll_market_payload()


@app.get("/api/news")
def legacy_news() -> dict:
    rows = [normalize_legacy_news(row) for row in legacy_read("news.json", [])]
    return {"items": rows}


@app.post("/api/news/like")
def legacy_news_like(payload: dict) -> dict:
    news_id = str(payload.get("id") or "").strip()
    rows = [normalize_legacy_news(row) for row in legacy_read("news.json", [])]
    for row in rows:
        if row["id"] == news_id:
            row["likes"] += 1
            legacy_write("news.json", rows)
            return {"ok": True, "item": row}
    raise HTTPException(status_code=404, detail="资讯不存在")


@app.post("/api/news/comment")
def legacy_news_comment(payload: dict, request: Request, db: Annotated[Session, Depends(get_db)]) -> dict:
    news_id = str(payload.get("id") or "").strip()
    content = str(payload.get("content") or "").strip()[:240]
    if not news_id or not content:
        raise HTTPException(status_code=400, detail="评论内容不能为空")
    user = cookie_user(request, db)
    author = user.display_name if user else str(payload.get("author") or "游客")
    rows = [normalize_legacy_news(row) for row in legacy_read("news.json", [])]
    for row in rows:
        if row["id"] == news_id:
            row["comments"].append({"id": secrets.token_hex(6), "author": author, "content": content, "date": datetime.now().strftime("%m-%d %H:%M")})
            row["comments"] = row["comments"][-50:]
            legacy_write("news.json", rows)
            return {"ok": True, "item": row}
    raise HTTPException(status_code=404, detail="资讯不存在")


@app.post("/api/news/publish")
def legacy_news_publish(payload: dict, request: Request, db: Annotated[Session, Depends(get_db)]) -> dict:
    user = cookie_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="请先登录后发布。")
    rows = [normalize_legacy_news(row) for row in legacy_read("news.json", [])]
    item = normalize_legacy_news(
        {
            **payload,
            "id": payload.get("id") or secrets.token_hex(8),
            "author": user.display_name,
            "source": user.display_name,
            "authorRole": user.role,
            "status": "已发布",
            "date": datetime.now().strftime("%m-%d"),
        }
    )
    index = next((i for i, row in enumerate(rows) if row["id"] == item["id"]), -1)
    if index >= 0:
        rows[index] = {**rows[index], **item}
    else:
        rows.insert(0, item)
    legacy_write("news.json", rows)
    return {"ok": True, "item": item, "pending": False}


@app.post("/api/admin/news")
@app.post("/api/admin/news-v2")
def legacy_admin_news(payload: dict, request: Request, db: Annotated[Session, Depends(get_db)]) -> dict:
    user = cookie_user(request, db)
    if not user or user.role != "admin":
        raise HTTPException(status_code=401, detail="请先登录管理员。")
    rows = [normalize_legacy_news(row) for row in legacy_read("news.json", [])]
    item = normalize_legacy_news({**payload, "id": payload.get("id") or secrets.token_hex(8), "date": payload.get("date") or datetime.now().strftime("%m-%d")})
    index = next((i for i, row in enumerate(rows) if row["id"] == item["id"]), -1)
    if index >= 0:
        rows[index] = {**rows[index], **item}
    else:
        rows.insert(0, item)
    legacy_write("news.json", rows)
    return {"ok": True, "item": item}


@app.post("/api/admin/news/status")
def legacy_admin_news_status(payload: dict, request: Request, db: Annotated[Session, Depends(get_db)]) -> dict:
    user = cookie_user(request, db)
    if not user or user.role != "admin":
        raise HTTPException(status_code=401, detail="没有审核权限。")
    news_id = str(payload.get("id") or "").strip()
    status_value = str(payload.get("status") or "已发布").strip()
    rows = [normalize_legacy_news(row) for row in legacy_read("news.json", [])]
    for row in rows:
        if row["id"] == news_id:
            row["status"] = status_value
            legacy_write("news.json", rows)
            return {"ok": True, "item": row}
    raise HTTPException(status_code=404, detail="内容不存在")


@app.post("/api/admin/news/delete")
def legacy_admin_news_delete(payload: dict, request: Request, db: Annotated[Session, Depends(get_db)]) -> dict[str, bool]:
    user = cookie_user(request, db)
    if not user or user.role != "admin":
        raise HTTPException(status_code=401, detail="请先登录管理员。")
    news_id = str(payload.get("id") or "").strip()
    rows = [row for row in [normalize_legacy_news(row) for row in legacy_read("news.json", [])] if row["id"] != news_id]
    legacy_write("news.json", rows)
    return {"ok": True}


@app.post("/api/admin/site-config")
def legacy_admin_site_config(payload: dict, request: Request, db: Annotated[Session, Depends(get_db)]) -> dict:
    user = cookie_user(request, db)
    if not user or user.role != "admin":
        raise HTTPException(status_code=401, detail="请先登录管理员。")
    current = legacy_site_config()
    next_config = {**current, **payload}
    next_config["homeRecommendationSortMode"] = "manual" if next_config.get("homeRecommendationSortMode") == "manual" else "volatility"
    recommendations = next_config.get("homeRecommendations")
    if isinstance(recommendations, list):
        normalized_recommendations = []
        gold_count = 0
        for entry in recommendations:
            if not isinstance(entry, dict):
                continue
            item_id = str(entry.get("itemId") or entry.get("id") or "").strip()
            if not item_id:
                continue
            if item_id.startswith("gold:"):
                if gold_count >= 2:
                    continue
                gold_count += 1
            normalized_recommendations.append({**entry, "itemId": item_id})
        next_config["homeRecommendations"] = normalized_recommendations
    legacy_write("site_config.json", next_config)
    return {"ok": True, "config": next_config}


@app.post("/api/admin/gold-settings")
def legacy_admin_gold_settings(payload: dict, request: Request, db: Annotated[Session, Depends(get_db)]) -> dict:
    user = cookie_user(request, db)
    if not user or user.role != "admin":
        raise HTTPException(status_code=401, detail="请先登录管理员。")
    current = legacy_read("gold_settings.json", {})
    settings = {**current, **payload}
    legacy_write("gold_settings.json", settings)
    return {"ok": True, "settings": settings}


@app.post("/api/admin/items/save")
def legacy_admin_item_save(payload: dict, request: Request, db: Annotated[Session, Depends(get_db)]) -> dict:
    user = cookie_user(request, db)
    if not user or user.role != "admin":
        raise HTTPException(status_code=401, detail="请先登录管理员。")
    rows = legacy_read("items.json", [])
    item_id = str(payload.get("id") or secrets.token_hex(8))
    item = {
        **payload,
        "id": item_id,
        "code": str(payload.get("code") or item_id),
        "name": str(payload.get("name") or "").strip(),
        "library": str(payload.get("library") or "物品库"),
        "category": str(payload.get("category") or "消耗品"),
        "img": str(payload.get("img") or payload.get("iconUrl") or "assets/items/tobi.png"),
    }
    if not item["name"]:
        raise HTTPException(status_code=400, detail="物品名称不能为空。")
    index = next((i for i, row in enumerate(rows) if str(row.get("id")) == item_id), -1)
    if index >= 0:
        rows[index] = {**rows[index], **item}
    else:
        rows.append(item)
    legacy_write("items.json", rows)
    return {"ok": True, "item": item}


@app.post("/api/admin/monsters/save")
def legacy_admin_monster_save(payload: dict, request: Request, db: Annotated[Session, Depends(get_db)]) -> dict:
    user = cookie_user(request, db)
    if not user or user.role != "admin":
        raise HTTPException(status_code=401, detail="请先登录管理员。")
    rows = legacy_read("monsters.json", [])
    monster_id = str(payload.get("id") or secrets.token_hex(8))
    item = {
        **payload,
        "id": monster_id,
        "img": str(payload.get("img") or "assets/monsters/slime.png"),
        "name": str(payload.get("name") or "").strip(),
        "level": int(payload.get("level") or 1),
        "hp": int(payload.get("hp") or 0),
        "exp": int(payload.get("exp") or 0),
        "area": str(payload.get("area") or "金银岛"),
        "map": str(payload.get("map") or payload.get("mapName") or "").strip(),
        "density": str(payload.get("density") or "中"),
        "attributes": payload.get("attributes") if isinstance(payload.get("attributes"), list) else ["普通"],
        "drops": payload.get("drops") if isinstance(payload.get("drops"), dict) else {"equipment": [], "consumable": [], "other": []},
    }
    if not item["name"] or not item["map"]:
        raise HTTPException(status_code=400, detail="怪物名称和地图不能为空。")
    index = next((i for i, row in enumerate(rows) if str(row.get("id")) == monster_id), -1)
    if index >= 0:
        rows[index] = {**rows[index], **item}
    else:
        rows.append(item)
    legacy_write("monsters.json", rows)
    return {"ok": True, "item": item}


@app.get("/api/items")
def items(
    library: str = "",
    category: str = "",
    q: str = "",
    limit: int = 60,
    offset: int = 0,
    db: Session = Depends(get_db),
) -> dict:
    legacy_items = legacy_read("items.json", [])
    if legacy_items:
        rows = legacy_items
        if library:
            rows = [row for row in rows if row.get("library") == library]
        if category:
            rows = [row for row in rows if row.get("category") == category]
        if q:
            rows = [row for row in rows if q in str(row.get("name", ""))]
        return {"total": len(rows), "items": rows}
    query = db.query(Item)
    if library:
        query = query.filter(Item.library == library)
    if category:
        query = query.filter(Item.category == category)
    if q:
        query = query.filter(Item.name.contains(q))
    rows = query.order_by(Item.library, Item.category, Item.level_required, Item.id).offset(max(offset, 0)).limit(min(max(limit, 1), 200)).all()
    payload = [
        {
            "id": str(row.id),
            "code": row.external_id or str(row.id),
            "name": row.name,
            "category": row.category,
            "library": row.library,
            "subCategory": row.subcategory,
            "section": row.subcategory,
            "kind": row.tags or row.category,
            "img": row.icon_url,
            "description": row.description,
            "stats": [],
        }
        for row in rows
    ]
    return {"total": query.count(), "items": payload}


@app.get("/api/monsters")
def monsters(q: str = "", limit: int = 60, offset: int = 0, db: Session = Depends(get_db)) -> dict:
    legacy_monsters = legacy_read("monsters.json", [])
    if legacy_monsters:
        rows = legacy_monsters
        if q:
            rows = [row for row in rows if q in str(row.get("name", "")) or q in str(row.get("map", ""))]
        return {"total": len(rows), "items": rows}
    query = db.query(Monster)
    if q:
        query = query.filter(Monster.name.contains(q))
    rows = query.order_by(Monster.level, Monster.id).offset(max(offset, 0)).limit(min(max(limit, 1), 200)).all()
    payload = [
        {
            "id": str(row.id),
            "img": row.icon_url,
            "name": row.name,
            "level": row.level,
            "hp": row.hp,
            "exp": row.exp,
            "area": row.area,
            "map": row.map_name,
            "density": "中",
            "attributes": ["普通"],
            "drops": {"equipment": [], "consumable": [], "other": []},
        }
        for row in rows
    ]
    return {"total": query.count(), "items": payload}


@app.get("/api/monsters/{monster_id}/drops", response_model=list[DropOut])
def monster_drops(monster_id: int, db: Session = Depends(get_db)) -> list[DropOut]:
    rows = db.query(MonsterDrop).filter(MonsterDrop.monster_id == monster_id).order_by(MonsterDrop.drop_group, MonsterDrop.id).all()
    return [to_drop_out(row) for row in rows]


@app.get("/api/posts", response_model=list[PostOut])
def posts(channel: str = "community", db: Session = Depends(get_db)) -> list[PostOut]:
    rows = db.query(Post).filter(Post.channel == channel, Post.status == "published").order_by(Post.created_at.desc()).limit(80).all()
    return [to_post_out(row) for row in rows]


@app.get("/api/posts/{post_id}", response_model=PostDetailOut)
def post_detail(post_id: int, db: Session = Depends(get_db)) -> PostDetailOut:
    post = db.get(Post, post_id)
    if not post or post.status != "published":
        raise HTTPException(status_code=404, detail="内容不存在")
    return to_post_detail_out(post)


@app.post("/api/posts/{post_id}/like", response_model=PostOut)
def like_post(post_id: int, db: Annotated[Session, Depends(get_db)]) -> PostOut:
    post = db.get(Post, post_id)
    if not post or post.status != "published":
        raise HTTPException(status_code=404, detail="内容不存在")
    post.likes_count += 1
    db.commit()
    db.refresh(post)
    return to_post_out(post)


@app.get("/api/posts/{post_id}/comments", response_model=list[CommentOut])
def comments(post_id: int, db: Session = Depends(get_db)) -> list[CommentOut]:
    rows = db.query(Comment).filter(Comment.post_id == post_id, Comment.is_deleted == False).order_by(Comment.created_at.desc()).all()  # noqa: E712
    return [to_comment_out(row) for row in rows]


@app.post("/api/posts/{post_id}/comments", response_model=CommentOut)
def create_comment(
    post_id: int,
    payload: CommentIn,
    user: Annotated[User, Depends(current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> CommentOut:
    if not db.get(Post, post_id):
        raise HTTPException(status_code=404, detail="内容不存在")
    row = Comment(post_id=post_id, author_id=user.id, content=payload.content)
    db.add(row)
    db.commit()
    db.refresh(row)
    return to_comment_out(row)


@app.delete("/api/comments/{comment_id}")
def delete_comment(comment_id: int, user: Annotated[User, Depends(current_user)], db: Annotated[Session, Depends(get_db)]) -> dict[str, bool]:
    row = db.get(Comment, comment_id)
    if not row:
        raise HTTPException(status_code=404, detail="评论不存在")
    if row.author_id != user.id and user.role != "admin":
        raise HTTPException(status_code=403, detail="没有权限")
    row.is_deleted = True
    db.commit()
    return {"ok": True}


@app.get("/api/market/servers", response_model=list[MarketServerOut])
def market_servers(db: Session = Depends(get_db)) -> list[MarketServerOut]:
    rows = db.query(MarketServer).order_by(MarketServer.area, MarketServer.id).all()
    return [to_market_server_out(row) for row in rows]


@app.get("/api/market/quotes", response_model=list[MarketQuoteOut])
def market_quotes(server_id: int = 0, limit: int = 120, db: Session = Depends(get_db)) -> list[MarketQuoteOut]:
    query = db.query(MarketQuote)
    if server_id:
        query = query.filter(MarketQuote.server_id == server_id)
    rows = query.order_by(MarketQuote.created_at.desc()).limit(min(max(limit, 1), 500)).all()
    return [to_market_quote_out(row) for row in rows]


@app.get("/api/home-slots", response_model=list[HomeSlotOut])
def home_slots(db: Session = Depends(get_db)) -> list[HomeSlotOut]:
    rows = db.query(HomeSlot).order_by(HomeSlot.sort_order, HomeSlot.id).all()
    return [to_home_slot_out(row) for row in rows]


@app.post("/api/admin/categories", response_model=CategoryOut)
def admin_create_category(payload: CategoryIn, _: Annotated[User, Depends(admin_user)], db: Annotated[Session, Depends(get_db)]) -> CategoryOut:
    row = Category(scope=payload.scope, name=payload.name, sort_order=payload.sortOrder)
    db.add(row)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=409, detail="分类已存在") from exc
    db.refresh(row)
    return to_category_out(row)


@app.put("/api/admin/categories/{category_id}", response_model=CategoryOut)
def admin_update_category(
    category_id: int,
    payload: CategoryIn,
    _: Annotated[User, Depends(admin_user)],
    db: Annotated[Session, Depends(get_db)],
) -> CategoryOut:
    row = db.get(Category, category_id)
    if not row:
        raise HTTPException(status_code=404, detail="分类不存在")
    row.scope = payload.scope
    row.name = payload.name
    row.sort_order = payload.sortOrder
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=409, detail="分类已存在") from exc
    db.refresh(row)
    return to_category_out(row)


@app.delete("/api/admin/categories/{category_id}")
def admin_delete_category(category_id: int, _: Annotated[User, Depends(admin_user)], db: Annotated[Session, Depends(get_db)]) -> dict[str, bool]:
    row = db.get(Category, category_id)
    if not row:
        raise HTTPException(status_code=404, detail="分类不存在")
    db.delete(row)
    db.commit()
    return {"ok": True}


@app.post("/api/admin/items", response_model=ItemOut)
def admin_create_item(payload: ItemIn, _: Annotated[User, Depends(admin_user)], db: Annotated[Session, Depends(get_db)]) -> ItemOut:
    row = Item(
        library=payload.library,
        category=payload.category,
        subcategory=payload.subcategory,
        name=payload.name,
        icon_url=payload.iconUrl,
        level_required=payload.levelRequired,
        job=payload.job,
        description=payload.description,
        tags=payload.tags,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return to_item_out(row)


@app.put("/api/admin/items/{item_id}", response_model=ItemOut)
def admin_update_item(item_id: int, payload: ItemIn, _: Annotated[User, Depends(admin_user)], db: Annotated[Session, Depends(get_db)]) -> ItemOut:
    row = db.get(Item, item_id)
    if not row:
        raise HTTPException(status_code=404, detail="物品不存在")
    row.library = payload.library
    row.category = payload.category
    row.subcategory = payload.subcategory
    row.name = payload.name
    row.icon_url = payload.iconUrl
    row.level_required = payload.levelRequired
    row.job = payload.job
    row.description = payload.description
    row.tags = payload.tags
    db.commit()
    db.refresh(row)
    return to_item_out(row)


@app.delete("/api/admin/items/{item_id}")
def admin_delete_item(item_id: str, request: Request, db: Annotated[Session, Depends(get_db)]) -> dict[str, bool]:
    user = cookie_user(request, db)
    if not user or user.role != "admin":
        raise HTTPException(status_code=401, detail="请先登录管理员。")
    legacy_rows = legacy_read("items.json", [])
    next_rows = [row for row in legacy_rows if str(row.get("id")) != item_id]
    if len(next_rows) != len(legacy_rows):
        legacy_write("items.json", next_rows)
        return {"ok": True}
    if item_id.isdigit():
        row = db.get(Item, int(item_id))
        if row:
            db.delete(row)
            db.commit()
            return {"ok": True}
    raise HTTPException(status_code=404, detail="物品不存在")


@app.post("/api/admin/monsters", response_model=MonsterOut)
def admin_create_monster(payload: MonsterIn, _: Annotated[User, Depends(admin_user)], db: Annotated[Session, Depends(get_db)]) -> MonsterOut:
    row = Monster(
        name=payload.name,
        level=payload.level,
        hp=payload.hp,
        exp=payload.exp,
        area=payload.area,
        map_name=payload.mapName,
        icon_url=payload.iconUrl,
        attributes=payload.attributes,
        description=payload.description,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return to_monster_out(row)


@app.put("/api/admin/monsters/{monster_id}", response_model=MonsterOut)
def admin_update_monster(monster_id: int, payload: MonsterIn, _: Annotated[User, Depends(admin_user)], db: Annotated[Session, Depends(get_db)]) -> MonsterOut:
    row = db.get(Monster, monster_id)
    if not row:
        raise HTTPException(status_code=404, detail="怪物不存在")
    row.name = payload.name
    row.level = payload.level
    row.hp = payload.hp
    row.exp = payload.exp
    row.area = payload.area
    row.map_name = payload.mapName
    row.icon_url = payload.iconUrl
    row.attributes = payload.attributes
    row.description = payload.description
    db.commit()
    db.refresh(row)
    return to_monster_out(row)


@app.delete("/api/admin/monsters/{monster_id}")
def admin_delete_monster(monster_id: str, request: Request, db: Annotated[Session, Depends(get_db)]) -> dict[str, bool]:
    user = cookie_user(request, db)
    if not user or user.role != "admin":
        raise HTTPException(status_code=401, detail="请先登录管理员。")
    legacy_rows = legacy_read("monsters.json", [])
    next_rows = [row for row in legacy_rows if str(row.get("id")) != monster_id]
    if len(next_rows) != len(legacy_rows):
        legacy_write("monsters.json", next_rows)
        return {"ok": True}
    if monster_id.isdigit():
        row = db.get(Monster, int(monster_id))
        if row:
            db.delete(row)
            db.commit()
            return {"ok": True}
    raise HTTPException(status_code=404, detail="怪物不存在")


@app.post("/api/admin/monsters/{monster_id}/drops", response_model=DropOut)
def admin_add_drop(monster_id: int, payload: DropIn, _: Annotated[User, Depends(admin_user)], db: Annotated[Session, Depends(get_db)]) -> DropOut:
    if not db.get(Monster, monster_id):
        raise HTTPException(status_code=404, detail="怪物不存在")
    if not db.get(Item, payload.itemId):
        raise HTTPException(status_code=404, detail="物品不存在")
    row = MonsterDrop(monster_id=monster_id, item_id=payload.itemId, drop_group=payload.dropGroup, note=payload.note)
    db.add(row)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=409, detail="掉落已存在") from exc
    db.refresh(row)
    return to_drop_out(row)


@app.delete("/api/admin/monsters/{monster_id}/drops/{item_id}")
def admin_delete_drop(monster_id: int, item_id: int, _: Annotated[User, Depends(admin_user)], db: Annotated[Session, Depends(get_db)]) -> dict[str, bool]:
    row = db.query(MonsterDrop).filter(MonsterDrop.monster_id == monster_id, MonsterDrop.item_id == item_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="掉落不存在")
    db.delete(row)
    db.commit()
    return {"ok": True}


@app.post("/api/admin/posts", response_model=PostDetailOut)
def admin_create_post(payload: PostIn, user: Annotated[User, Depends(current_user)], db: Annotated[Session, Depends(get_db)]) -> PostDetailOut:
    row = Post(
        channel=payload.channel,
        title=payload.title,
        summary=payload.summary,
        content=payload.content,
        cover_url=payload.coverUrl,
        video_url=payload.videoUrl,
        status="published",
        author_id=user.id,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return to_post_detail_out(row)


@app.put("/api/admin/posts/{post_id}", response_model=PostDetailOut)
def admin_update_post(post_id: int, payload: PostIn, user: Annotated[User, Depends(current_user)], db: Annotated[Session, Depends(get_db)]) -> PostDetailOut:
    row = db.get(Post, post_id)
    if not row:
        raise HTTPException(status_code=404, detail="内容不存在")
    if row.author_id != user.id and user.role != "admin":
        raise HTTPException(status_code=403, detail="没有权限")
    row.channel = payload.channel
    row.title = payload.title
    row.summary = payload.summary
    row.content = payload.content
    row.cover_url = payload.coverUrl
    row.video_url = payload.videoUrl
    db.commit()
    db.refresh(row)
    return to_post_detail_out(row)


@app.delete("/api/admin/posts/{post_id}")
def admin_delete_post(post_id: int, user: Annotated[User, Depends(current_user)], db: Annotated[Session, Depends(get_db)]) -> dict[str, bool]:
    row = db.get(Post, post_id)
    if not row:
        raise HTTPException(status_code=404, detail="内容不存在")
    if row.author_id != user.id and user.role != "admin":
        raise HTTPException(status_code=403, detail="没有权限")
    row.status = "deleted"
    db.commit()
    return {"ok": True}


@app.post("/api/admin/market/servers", response_model=MarketServerOut)
def admin_create_market_server(payload: MarketServerIn, _: Annotated[User, Depends(admin_user)], db: Annotated[Session, Depends(get_db)]) -> MarketServerOut:
    row = MarketServer(area=payload.area, name=payload.name, is_home_visible=payload.isHomeVisible)
    db.add(row)
    db.commit()
    db.refresh(row)
    return to_market_server_out(row)


@app.put("/api/admin/market/servers/{server_id}", response_model=MarketServerOut)
def admin_update_market_server(server_id: int, payload: MarketServerIn, _: Annotated[User, Depends(admin_user)], db: Annotated[Session, Depends(get_db)]) -> MarketServerOut:
    row = db.get(MarketServer, server_id)
    if not row:
        raise HTTPException(status_code=404, detail="区服不存在")
    row.area = payload.area
    row.name = payload.name
    row.is_home_visible = payload.isHomeVisible
    db.commit()
    db.refresh(row)
    return to_market_server_out(row)


@app.post("/api/admin/market/quotes", response_model=MarketQuoteOut)
def admin_create_market_quote(payload: MarketQuoteIn, _: Annotated[User, Depends(admin_user)], db: Annotated[Session, Depends(get_db)]) -> MarketQuoteOut:
    if not db.get(MarketServer, payload.serverId):
        raise HTTPException(status_code=404, detail="区服不存在")
    row = MarketQuote(server_id=payload.serverId, price_per_yi=payload.pricePerYi, source=payload.source)
    db.add(row)
    db.commit()
    db.refresh(row)
    return to_market_quote_out(row)


@app.post("/api/admin/home-slots", response_model=HomeSlotOut)
def admin_create_home_slot(payload: HomeSlotIn, _: Annotated[User, Depends(admin_user)], db: Annotated[Session, Depends(get_db)]) -> HomeSlotOut:
    row = HomeSlot(
        slot_key=payload.slotKey,
        title=payload.title,
        subtitle=payload.subtitle,
        target_type=payload.targetType,
        target_id=payload.targetId,
        sort_order=payload.sortOrder,
    )
    db.add(row)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=409, detail="推荐位已存在") from exc
    db.refresh(row)
    return to_home_slot_out(row)


@app.put("/api/admin/home-slots/{slot_id}", response_model=HomeSlotOut)
def admin_update_home_slot(slot_id: int, payload: HomeSlotIn, _: Annotated[User, Depends(admin_user)], db: Annotated[Session, Depends(get_db)]) -> HomeSlotOut:
    row = db.get(HomeSlot, slot_id)
    if not row:
        raise HTTPException(status_code=404, detail="推荐位不存在")
    row.slot_key = payload.slotKey
    row.title = payload.title
    row.subtitle = payload.subtitle
    row.target_type = payload.targetType
    row.target_id = payload.targetId
    row.sort_order = payload.sortOrder
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=409, detail="推荐位标识已存在") from exc
    db.refresh(row)
    return to_home_slot_out(row)


FRONTEND_DIR = (Path(__file__).resolve().parent.parent.parent / "frontend" / "dist").as_posix()
app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
