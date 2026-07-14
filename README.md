# 园本课程建设平台

面向幼儿园的园本课程建设 SaaS 平台，帮助幼儿园快速生成专业、科学、可落地的园本课程方案。

## 技术栈

- **后端**: Python 3.11 + FastAPI + PostgreSQL
- **前端**: Vue 3 + Vite + Element Plus
- **AI**: DeepSeek API
- **部署**: Docker Compose

## 项目结构

```
yuanbenkecheng/
├── demo/                # 🟢 当前 Demo（可直接运行）
│   ├── index.html       # 欢迎页 + 登录
│   ├── app.html         # 三版块主应用
│   ├── main.js          # 核心业务逻辑
│   ├── styles.css       # 样式
│   ├── db.js            # 浏览器数据库
│   ├── auth.js          # 登录注册
│   ├── api.js           # AI 调用
│   ├── server.py        # 本地服务器（启动这个）
│   ├── .env             # API 密钥
│   └── .env.example
│
├── backend/             # 🔵 V1 后端（FastAPI + PostgreSQL）
│   ├── app/
│   │   ├── api/         # API 端点
│   │   ├── core/        # 核心配置
│   │   ├── models/      # 数据模型
│   │   ├── routers/     # 路由
│   │   ├── schemas/     # 数据校验
│   │   └── services/    # 业务逻辑
│   └── requirements.txt
│
├── frontend/            # 🔵 V1 前端（Vue 3 + Vite）
│   ├── src/
│   │   ├── api/         # API 调用
│   │   ├── router/      # 路由
│   │   ├── stores/      # 状态管理
│   │   └── views/       # 页面组件
│   └── package.json
│
├── docs/                # 📄 产品文档
│   ├── PRD-园本课程建设平台V1.md   ← 核心文档
│   ├── 9AGent.md                    ← 原始需求
│   └── superpowers/                 ← 设计文档
│
├── docker-compose.yml   # Docker 部署配置
└── README.md
```

## 快速开始（Demo）

### 1. 配置 API 密钥

```bash
# 编辑 demo/.env 文件，填入 DeepSeek API Key
```

### 2. 启动服务器

```bash
python demo/server.py
```

### 3. 访问应用

打开浏览器访问 **http://localhost:8080/app.html**

---

## 快速开始（V1 完整版）

> 需要 Docker 环境，暂未启用。

### 1. 环境准备

确保已安装 Docker & Docker Compose

### 2. 启动服务

```bash
docker compose up -d
```

### 3. 访问应用

- **前端**: http://localhost:8080
- **后端 API**: http://localhost:8000
- **API 文档**: http://localhost:8000/docs

## 开发指南

### 后端开发

```bash
cd backend

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# 安装依赖
pip install -r requirements.txt

# 运行开发服务器
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 前端开发

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 数据库迁移

```bash
cd backend

# 初始化迁移（首次）
alembic init alembic

# 创建迁移
alembic revision --autogenerate -m "init"

# 应用迁移
alembic upgrade head
```

## 核心功能

1. **账号系统** - 园长/教师角色，多租户数据隔离
2. **园本课程建设** - 填写园所信息，AI 生成课程方案
3. **课程生成** - 生成教案和资源包
4. **我的园本课程** - 管理已生成的课程方案

## API 接口

### 认证
- `POST /api/auth/register` - 注册
- `POST /api/auth/login` - 登录
- `GET /api/auth/me` - 获取当前用户

### 园本课程
- `POST /api/curriculum/plans` - 创建方案
- `GET /api/curriculum/plans` - 方案列表
- `GET /api/curriculum/plans/{id}` - 方案详情
- `DELETE /api/curriculum/plans/{id}` - 删除方案

### 课程生成
- `POST /api/course/contents` - 创建课程内容
- `GET /api/course/contents/plan/{plan_id}` - 课程内容列表
- `POST /api/course/records` - 创建实施记录
- `GET /api/course/records/course/{course_id}` - 实施记录列表

### AI 聊天
- `POST /api/chat` - AI 对话

## 部署

### 生产环境部署

```bash
# 1. 配置生产环境变量
cp .env.example .env
# 编辑 .env，设置生产环境的 SECRET_KEY 和 DEEPSEEK_API_KEY

# 2. 构建镜像
docker compose -f docker-compose.yml build

# 3. 启动服务
docker compose up -d

# 4. 初始化数据库
docker compose exec api alembic upgrade head
```

### Nginx 配置（可选）

如需使用独立 Nginx 作为反向代理：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 常见问题

### 1. 数据库连接失败

确保 PostgreSQL 服务已启动：
```bash
docker compose ps
```

### 2. AI 调用失败

检查 `.env` 中的 `DEEPSEEK_API_KEY` 是否正确。

### 3. 前端无法访问后端 API

检查 `frontend/vite.config.js` 中的代理配置。

## 开发团队

- 后端开发: 2人
- 前端开发: 2人
- 全栈/运维: 1人
- 产品经理: 1人

## 许可证

MIT License
