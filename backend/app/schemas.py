from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class UserOut(BaseModel):
    id: int
    username: str
    displayName: str
    role: str
    avatarUrl: str = ""
    bio: str = ""


class ProfileIn(BaseModel):
    displayName: str = Field(min_length=1, max_length=40)
    avatarUrl: str = ""
    bio: str = ""


class LoginIn(BaseModel):
    username: str = Field(min_length=2, max_length=40)
    password: str = Field(min_length=6, max_length=80)


class RegisterIn(LoginIn):
    displayName: str = Field(min_length=1, max_length=40)
    recoveryQuestion: str = Field(min_length=1, max_length=120)
    recoveryAnswer: str = Field(min_length=1, max_length=120)
    inviteCode: str = ""


class AuthOut(BaseModel):
    ok: bool = True
    token: str
    user: UserOut


class CategoryOut(BaseModel):
    id: int
    scope: str
    name: str
    sortOrder: int


class CategoryIn(BaseModel):
    scope: str = Field(min_length=1, max_length=24)
    name: str = Field(min_length=1, max_length=40)
    sortOrder: int = 0


class ItemOut(BaseModel):
    id: int
    library: str
    category: str
    subcategory: str
    name: str
    iconUrl: str
    levelRequired: int
    job: str
    tags: str


class ItemIn(BaseModel):
    library: str = Field(min_length=1, max_length=24)
    category: str = Field(min_length=1, max_length=40)
    subcategory: str = ""
    name: str = Field(min_length=1, max_length=120)
    iconUrl: str = ""
    levelRequired: int = 0
    job: str = ""
    description: str = ""
    tags: str = ""


class ItemListOut(BaseModel):
    total: int
    items: list[ItemOut]


class MonsterOut(BaseModel):
    id: int
    name: str
    level: int
    hp: int
    exp: int
    area: str
    mapName: str
    iconUrl: str


class MonsterIn(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    level: int = 0
    hp: int = 0
    exp: int = 0
    area: str = ""
    mapName: str = ""
    iconUrl: str = ""
    attributes: str = ""
    description: str = ""


class MonsterListOut(BaseModel):
    total: int
    items: list[MonsterOut]


class DropItemOut(BaseModel):
    id: int
    name: str
    library: str
    category: str
    iconUrl: str
    dropGroup: str


class DropOut(DropItemOut):
    note: str = ""


class DropIn(BaseModel):
    itemId: int
    dropGroup: str = "other"
    note: str = ""


class PostOut(BaseModel):
    id: int
    channel: str
    title: str
    summary: str
    coverUrl: str
    videoUrl: str
    authorName: str
    likesCount: int
    commentsCount: int
    createdAt: datetime


class PostDetailOut(PostOut):
    content: str


class PostIn(BaseModel):
    channel: str = "community"
    title: str = Field(min_length=1, max_length=160)
    summary: str = ""
    content: str = ""
    coverUrl: str = ""
    videoUrl: str = ""


class CommentOut(BaseModel):
    id: int
    postId: int
    authorName: str
    avatarUrl: str = ""
    content: str
    createdAt: datetime


class CommentIn(BaseModel):
    content: str = Field(min_length=1, max_length=1000)


class MarketServerOut(BaseModel):
    id: int
    area: str
    name: str
    isHomeVisible: bool


class MarketServerIn(BaseModel):
    area: str = Field(min_length=1, max_length=80)
    name: str = Field(min_length=1, max_length=120)
    isHomeVisible: bool = False


class MarketQuoteOut(BaseModel):
    id: int
    serverId: int
    serverName: str
    area: str
    pricePerYi: float
    source: str
    createdAt: datetime


class MarketQuoteIn(BaseModel):
    serverId: int
    pricePerYi: float
    source: str = ""


class HomeSlotOut(BaseModel):
    id: int
    slotKey: str
    title: str
    subtitle: str
    targetType: str
    targetId: str
    sortOrder: int


class HomeSlotIn(BaseModel):
    slotKey: str = Field(min_length=1, max_length=60)
    title: str = Field(min_length=1, max_length=80)
    subtitle: str = ""
    targetType: str = ""
    targetId: str = ""
    sortOrder: int = 0
