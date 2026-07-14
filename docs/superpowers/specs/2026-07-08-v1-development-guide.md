# 园本课程建设平台 V1 开发指南

## 一、技术选型总览

| 维度 | 决策 | 说明 |
|------|------|------|
| 产品定位 | SaaS，面向全国幼儿园 | 多租户，数据隔离 |
| 后端 | Python + FastAPI | 异步高性能，AI 生态好 |
| 前端 | Vue 3 + Vite | 组件化，学习曲线平缓 |
| 数据库 | PostgreSQL | JSONB 适配课程方案，RLS 实现多租户隔离 |
| 部署 | 云服务器 + Docker Compose | 阿里云/腾讯云，初期 2C4G |
| AI 模型 | 先 DeepSeek，后阿里百炼 | 统一调用层，换模型只改配置 |
| 团队 | 5人开发 + PM | 可分工协作 |
| 周期 | 3-4个月 | V1 功能做扎实 |

---

## 二、V1 功能范围（基于 Demo 做扎实）

### 2.1 核心功能清单

| 功能模块 | Demo 现状 | V1 要求 |
|---------|----------|---------|
| 账号系统 | 本地 IndexedDB 存储 | 服务端持久化，JWT 鉴权，多租户隔离 |
| 园本课程建设 | 表单填写 + 模板生成 | 表单持久化，AI 生成调用真实 API |
| 课程生成 | 教案/资源包生成 | 服务端存储，AI 优化，导出 PDF |
| 我的园本课程 | 本地 IndexedDB | 服务端 CRUD，编辑/下载/删除 |
| 上传记录 | 本地存储 | 对象存储（OSS），支持图片/文档/视频 |
| 关联作品 | 弹窗查看 | 服务端关联查询 |

### 2.2 V1 不包含的功能

- 支付/订阅系统（V2 考虑）
- 多老师协作编辑（V2 考虑）
- 小程序端（V2 考虑）
- 多模型切换（V1 只做 DeepSeek）

---

## 三、架构设计要点

### 3.1 整体架构

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Vue 3 前端  │────▶│ FastAPI 后端 │────▶│ PostgreSQL  │
│  (Vite 构建) │     │  (Docker)   │     │  (Docker)   │
└─────────────┘     └──────┬──────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  DeepSeek   │
                    │  API 代理   │
                    └─────────────┘
```

### 3.2 多租户数据隔离

**方案：行级隔离（Row-Level Security）**

- 所有业务表加 `kinder_id` 字段
- PostgreSQL RLS 策略：`WHERE kinder_id = current_setting('app.current_kinder_id')`
- 每个请求通过 JWT 解析出 `kinder_id`，设置到数据库会话

### 3.3 AI 调用层设计

```python
# 统一接口，换模型只改配置
class AIClient:
    def chat(self, system_prompt: str, user_prompt: str) -> str:
        pass

# 实现类
class DeepSeekClient(AIClient): ...
class AliBaiLianClient(AIClient): ...  # V2
```

---

## 四、开发注意事项

### 4.1 代码组织

| 问题 | Demo 现状 | V1 改进 |
|------|----------|---------|
| 前端单文件 216KB | main.js 过大 | 按功能拆分组件：`views/`、`components/` |
| 后端单文件 | server.py 简单 | 按模块拆分：`routers/`、`services/`、`models/` |
| 无类型约束 | 原生 JS | TypeScript 可选，至少用 JSDoc 注释 |

### 4.2 安全要点

1. **API Key 不暴露** — 前端只调后端 `/api/chat`，后端持有 DeepSeek Key
2. **JWT 鉴权** — 每个接口校验 token，过期时间 2 小时
3. **输入校验** — FastAPI 的 Pydantic 模型自动校验，防止注入
4. **HTTPS** — Nginx 反向代理，Let's Encrypt 免费证书

### 4.3 性能要点

1. **AI 调用异步化** — FastAPI 的 `async def` + `httpx`，不阻塞主线程
2. **课程方案分页** — 列表接口加 `limit/offset`，避免一次性加载全部
3. **文件上传用 OSS** — 图片/视频不存数据库，用阿里云 OSS 或腾讯云 COS
4. **数据库索引** — `kinder_id`、`created_at` 等高频查询字段加索引

### 4.4 部署要点

1. **Docker Compose 编排** — `docker-compose.yml` 包含：
   - `api`：FastAPI 后端
   - `web`：Vue 前端（Nginx 托管静态文件）
   - `db`：PostgreSQL
   - `nginx`：反向代理 + HTTPS

2. **环境变量管理** — `.env` 文件不进 Git，用 `.env.example` 做模板

3. **数据备份** — PostgreSQL 定时备份到 OSS，保留 7 天

---

## 五、团队分工建议（5人）

| 角色 | 人数 | 职责 |
|------|------|------|
| 后端开发 | 2人 | FastAPI + PostgreSQL + AI 调用层 |
| 前端开发 | 2人 | Vue 3 组件 + 页面 + 联调 |
| 全栈/运维 | 1人 | Docker 部署 + CI/CD + 测试 |

**协作流程：**
1. 后端先出 API 文档（Swagger 自动生成）
2. 前端根据 Mock 数据开发
3. 联调阶段对接真实接口
4. 测试通过后合并到 `main` 分支

---

## 六、开发节奏（3-4个月）

| 阶段 | 时间 | 里程碑 |
|------|------|--------|
| 第1周 | 项目搭建 | 仓库、Docker、CI/CD、数据库迁移 |
| 第2-4周 | 账号系统 | 注册/登录/JWT/多租户隔离 |
| 第5-8周 | 园本课程建设 | 表单持久化 + AI 生成 |
| 第9-12周 | 课程生成 | 教案/资源包 + PDF 导出 |
| 第13-14周 | 我的园本课程 | CRUD + 文件上传 |
| 第15-16周 | 联调测试 | 端到端测试 + Bug 修复 |
| 第17周 | 部署上线 | 云服务器部署 + 域名备案 |

---

## 七、从 Demo 迁移的关键改动

| Demo 代码 | V1 改动 |
|-----------|---------|
| `db.js` (IndexedDB) | 改为调用后端 REST API |
| `main.js` 单文件 | 拆分为 Vue 组件 |
| `server.py` (http.server) | 替换为 FastAPI |
| `api.js` (前端直调) | 保持，但后端换成 FastAPI |
| `.env` (API Key) | 后端读取，前端不接触 |

---

## 八、风险与应对

| 风险 | 应对措施 |
|------|----------|
| AI 调用超时 | 设置 60s 超时，失败返回模板结果 |
| 多租户数据泄露 | RLS 策略 + 单元测试覆盖 |
| 文件存储成本 | OSS 按量付费，设置生命周期策略 |
| 团队经验不足 | 先做技术预研，跑通核心链路再全面开发 |

---

## 九、下一步行动

1. **确认本指南** — 团队评审，确认技术选型和分工
2. **搭建项目骨架** — 创建 Git 仓库，初始化 FastAPI + Vue 3 + Docker
3. **跑通核心链路** — 注册 → 登录 → 生成方案 → 保存，端到端验证
4. **逐步迭代** — 按里程碑推进，每周 Demo 评审
