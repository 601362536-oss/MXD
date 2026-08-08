# Maple Terminal V2

正式前后端分离版本。这个项目不修改旧原型，旧站只作为数据和视觉参考。

## 技术栈

- 前端：React + TypeScript + Vite
- 后端：FastAPI + SQLAlchemy
- 数据库：SQLite 开发版，后续可迁移 PostgreSQL
- 静态资源：`frontend/public/assets`

## 本地启动

后端：
```powershell
cd E:\maple-terminal-v2\backend
python run.py
```

前端：
```powershell
cd E:\maple-terminal-v2\frontend
npm run dev -- --host 127.0.0.1
```

默认地址：

- 前端：http://127.0.0.1:5173
- 后端：http://127.0.0.1:8801
- API 文档：http://127.0.0.1:8801/docs

## 默认管理员

- 账号：`admin`
- 密码：`maple2026`

## 当前已完成

- 迁移旧原型资料到 V2 数据库：1511 件物品、83 个怪物、764 条掉落关系。
- 管理员登录、玩家注册、个人资料编辑。
- 物品库、装备库、怪物图鉴、分类、掉落、帖子、评论、点赞、区服、报价、首页推荐位 API。
- 前端页面：首页、图鉴、物品、行情、资讯、开荒、管理。
- 管理后台入口：导入物品、新增怪物、分类维护、行情录入、首页推荐位。

## 设计原则

- 视觉保留旧版浅色资料站风格，不做深色金融后台。
- 前台展示和后台编辑都读取同一套后端数据。
- 管理员尽量通过选择、弹窗、卡片化维护内容，不直接接触代码。
