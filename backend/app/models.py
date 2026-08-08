from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class User(TimestampMixin, Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(160))
    display_name: Mapped[str] = mapped_column(String(40))
    avatar_url: Mapped[str] = mapped_column(String(500), default="")
    bio: Mapped[str] = mapped_column(String(240), default="")
    role: Mapped[str] = mapped_column(String(24), default="player")
    recovery_question: Mapped[str] = mapped_column(String(120), default="")
    recovery_answer_hash: Mapped[str] = mapped_column(String(160), default="")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    posts: Mapped[list["Post"]] = relationship(back_populates="author")


class Category(TimestampMixin, Base):
    __tablename__ = "categories"
    __table_args__ = (UniqueConstraint("scope", "name", name="uq_category_scope_name"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    scope: Mapped[str] = mapped_column(String(24), index=True)
    name: Mapped[str] = mapped_column(String(40))
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    is_system: Mapped[bool] = mapped_column(Boolean, default=False)


class Item(TimestampMixin, Base):
    __tablename__ = "items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    external_id: Mapped[str] = mapped_column(String(80), default="", index=True)
    library: Mapped[str] = mapped_column(String(24), index=True)
    category: Mapped[str] = mapped_column(String(40), index=True)
    subcategory: Mapped[str] = mapped_column(String(60), default="", index=True)
    name: Mapped[str] = mapped_column(String(120), index=True)
    icon_url: Mapped[str] = mapped_column(String(500), default="")
    level_required: Mapped[int] = mapped_column(Integer, default=0)
    job: Mapped[str] = mapped_column(String(80), default="")
    description: Mapped[str] = mapped_column(Text, default="")
    tags: Mapped[str] = mapped_column(String(300), default="")


class Monster(TimestampMixin, Base):
    __tablename__ = "monsters"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    external_id: Mapped[str] = mapped_column(String(80), default="", index=True)
    name: Mapped[str] = mapped_column(String(120), index=True)
    level: Mapped[int] = mapped_column(Integer, default=0, index=True)
    hp: Mapped[int] = mapped_column(Integer, default=0)
    exp: Mapped[int] = mapped_column(Integer, default=0)
    area: Mapped[str] = mapped_column(String(120), default="")
    map_name: Mapped[str] = mapped_column(String(160), default="")
    icon_url: Mapped[str] = mapped_column(String(500), default="")
    attributes: Mapped[str] = mapped_column(String(300), default="")
    description: Mapped[str] = mapped_column(Text, default="")

    drops: Mapped[list["MonsterDrop"]] = relationship(back_populates="monster", cascade="all, delete-orphan")


class MonsterDrop(TimestampMixin, Base):
    __tablename__ = "monster_drops"
    __table_args__ = (UniqueConstraint("monster_id", "item_id", name="uq_monster_item_drop"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    monster_id: Mapped[int] = mapped_column(ForeignKey("monsters.id"), index=True)
    item_id: Mapped[int] = mapped_column(ForeignKey("items.id"), index=True)
    drop_group: Mapped[str] = mapped_column(String(40), default="")
    note: Mapped[str] = mapped_column(String(160), default="")

    monster: Mapped[Monster] = relationship(back_populates="drops")
    item: Mapped[Item] = relationship()


class Post(TimestampMixin, Base):
    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    channel: Mapped[str] = mapped_column(String(24), index=True)
    title: Mapped[str] = mapped_column(String(160))
    summary: Mapped[str] = mapped_column(String(300), default="")
    content: Mapped[str] = mapped_column(Text, default="")
    cover_url: Mapped[str] = mapped_column(String(500), default="")
    video_url: Mapped[str] = mapped_column(String(500), default="")
    status: Mapped[str] = mapped_column(String(24), default="published", index=True)
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    likes_count: Mapped[int] = mapped_column(Integer, default=0)

    author: Mapped[User] = relationship(back_populates="posts")
    comments: Mapped[list["Comment"]] = relationship(back_populates="post", cascade="all, delete-orphan")


class Comment(TimestampMixin, Base):
    __tablename__ = "comments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    post_id: Mapped[int] = mapped_column(ForeignKey("posts.id"), index=True)
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    content: Mapped[str] = mapped_column(Text)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)

    post: Mapped[Post] = relationship(back_populates="comments")
    author: Mapped[User] = relationship()


class MarketServer(TimestampMixin, Base):
    __tablename__ = "market_servers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    area: Mapped[str] = mapped_column(String(80), default="")
    name: Mapped[str] = mapped_column(String(120), index=True)
    is_home_visible: Mapped[bool] = mapped_column(Boolean, default=False)

    quotes: Mapped[list["MarketQuote"]] = relationship(cascade="all, delete-orphan")


class MarketQuote(TimestampMixin, Base):
    __tablename__ = "market_quotes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    server_id: Mapped[int] = mapped_column(ForeignKey("market_servers.id"), index=True)
    price_per_yi: Mapped[float] = mapped_column(Float)
    source: Mapped[str] = mapped_column(String(80), default="")

    server: Mapped[MarketServer] = relationship()


class HomeSlot(TimestampMixin, Base):
    __tablename__ = "home_slots"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    slot_key: Mapped[str] = mapped_column(String(60), unique=True)
    title: Mapped[str] = mapped_column(String(80))
    subtitle: Mapped[str] = mapped_column(String(160), default="")
    target_type: Mapped[str] = mapped_column(String(40), default="")
    target_id: Mapped[str] = mapped_column(String(80), default="")
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
