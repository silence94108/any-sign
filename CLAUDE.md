# AnyRouter Check-in 项目指南

## 项目概述

多平台多账号自动签到工具，兼容 NewAPI / OneAPI 全系列平台。支持 Docker 自部署（Web 管理面板）和 GitHub Actions 两种运行方式。

## 技术栈

- **语言**: Python 3.11+（`pyproject.toml` 指定 `>=3.11`）
- **包管理**: uv（lockfile: `uv.lock`）
- **Web 框架**: FastAPI + uvicorn
- **模板引擎**: Jinja2（`web/templates/`）
- **数据库**: SQLite（aiosqlite），数据文件 `data/checkin.db`
- **定时任务**: APScheduler（AsyncIOScheduler）
- **浏览器自动化**: Playwright（Chromium，用于 WAF 绕过和浏览器登录）
- **HTTP 客户端**: httpx（支持 HTTP/2）
- **Lint / Format**: ruff（pre-commit 集成）
- **测试**: pytest + pytest-mock + pytest-cov

## 项目结构

```
├── checkin.py              # 核心签到逻辑（GitHub Actions 入口）
├── web/
│   ├── app.py              # FastAPI 应用入口，路由注册，启动初始化
│   ├── auth.py             # 认证中间件，密码验证，Cookie 管理
│   ├── database.py         # SQLite 数据层（accounts/providers/logs/settings/waf_cookies CRUD）
│   ├── scheduler.py        # APScheduler 定时签到，签到任务编排（WAF 缓存 + 重试逻辑）
│   ├── browser_checkin.py  # Playwright 浏览器登录签到
│   ├── failure_reason.py   # 签到失败原因分类与摘要
│   ├── routes/
│   │   ├── accounts.py     # 账号管理 API
│   │   ├── checkin.py      # 签到触发 API
│   │   ├── logs.py         # 日志查询 API
│   │   └── providers.py    # Provider 管理 API
│   ├── static/app.js       # 前端 JavaScript
│   └── templates/          # Jinja2 HTML 模板（dashboard/accounts/providers/logs/login）
├── utils/
│   ├── config.py           # 配置数据类（AccountConfig, ProviderConfig, AppConfig）
│   └── notify.py           # 多渠道消息推送（TG/钉钉/飞书/企微/邮箱/PushPlus/Server酱/Gotify/Bark）
├── tests/                  # pytest 测试用例
├── pyproject.toml          # 项目依赖与 ruff 配置
├── docker-compose.yml      # Docker Compose 部署配置
├── Dockerfile              # 容器构建（含 Playwright Chromium）
└── .github/workflows/      # GitHub Actions 签到工作流
```

## 常用命令

```bash
# 安装依赖
uv sync

# 本地启动（开发）
uv run uvicorn web.app:app --host 0.0.0.0 --port 8080

# 运行测试
uv run pytest

# 运行 lint
uv run ruff check .

# 运行 format
uv run ruff format .

# Docker 部署
docker compose up -d --build
```

## 代码规范

- **缩进**: Tab（非空格），由 ruff format 强制
- **引号**: 单引号（`quote-style = "single"`）
- **行宽**: 120 字符
- **Lint 规则**: ASYNC, E, F, FAST, I, PLE（详见 `pyproject.toml [tool.ruff.lint]`）
- **Pre-commit**: trailing-whitespace, end-of-file-fixer, ruff check + format

## 数据库 Schema（SQLite）

| 表名 | 用途 |
|------|------|
| `accounts` | 签到账号（name, provider, auth_method, cookies, api_user, username, password, domain, enabled...） |
| `providers` | 签到平台配置（name, domain, login_path, sign_in_path, user_info_path, bypass_method...） |
| `checkin_logs` | 签到日志（account_id, status, balance, used_quota, message, triggered_by...） |
| `settings` | KV 配置存储（如 cron_expression） |
| `waf_cookies` | WAF Cookie 缓存（provider_id, cookies, expires_at，24h TTL） |

内置 Provider: `newapi`, `newapi-waf`, `anyrouter`, `agentrouter`

## 签到流程

1. **Cookie 模式**: 直接用 session cookie + api_user 发起 HTTP 请求签到
2. **浏览器登录模式**: Playwright 启动 Chromium → 自动登录 → 签到 → 查询余额
3. **WAF 绕过**: 先查缓存 → 缓存未命中则 Playwright 获取 WAF cookies → 合并到请求中 → 失败时刷新缓存重试 → 最终回退到无 WAF 请求

## 环境变量

- `ADMIN_PASSWORD`: 管理面板登录密码
- `TZ`: 时区（默认 `Asia/Shanghai`）
- 通知配置: `TELEGRAM_BOT_TOKEN`, `DINGDING_WEBHOOK`, `FEISHU_WEBHOOK` 等（详见 `.env.example`）

## 注意事项

- `data/` 目录为运行时数据，已在 `.gitignore` 中排除
- 修改 Provider 内置配置需编辑 `web/database.py` 的 `_init_builtin_providers()`
- 签到任务有全局 asyncio.Lock 防并发
- WAF cookie 缓存 24 小时自动过期，模板 Provider 按 `provider_name:account_domain` 隔离缓存
