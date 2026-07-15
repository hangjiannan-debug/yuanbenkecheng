# 园本课程建设平台 V1 - 快速启动指南

## 项目已搭建完成 ✅

项目骨架已完成，包含：

### 后端（FastAPI）
- ✅ 数据库模型（User, Kinder, CurriculumPlan, CourseContent, ImplementationRecord）
- ✅ API 路由（认证、课程方案、课程内容）
- ✅ AI 调用层（DeepSeek 集成）
- ✅ JWT 认证
- ✅ Alembic 数据库迁移

### 前端（Vue 3）
- ✅ 路由配置（登录、注册、主布局）
- ✅ 状态管理（Pinia）
- ✅ API 调用封装（Axios）
- ✅ 基础页面（Login, Register, Layout）
- ✅ Element Plus UI 组件库

### 部署配置
- ✅ Docker Compose 编排
- ✅ PostgreSQL 数据库
- ✅ Nginx 反向代理
- ✅ 环境变量管理

---

## 立即开始开发

### 1. 启动服务

```bash
# 在项目根目录执行
docker compose up -d

# 查看服务状态
docker compose ps

# 查看日志
docker compose logs -f
```

### 2. 访问应用

- **前端**: http://localhost:8080
- **后端 API**: http://localhost:8000
- **API 文档**: http://localhost:8000/docs

### 3. 初始化数据库

```bash
# 进入后端容器
docker compose exec api bash

# 运行数据库迁移
alembic upgrade head

# 退出
exit
```

### 4. 注册账号

访问 http://localhost:8080/register

- 园长账号：选择"园长"角色，填写幼儿园名称
- 教师账号：选择"教师"角色（需园长创建）

---

## 下一步开发任务

### 优先级 1：完善核心功能

1. **园本课程建设页面** (`frontend/src/views/Curriculum.vue`)
   - 实现园所信息表单（6大板块）
   - 对接后端 API 保存方案
   - 集成 AI 生成调用

2. **课程生成页面** (`frontend/src/views/Course.vue`)
   - 实现教案/资源包生成
   - 对接 AI 优化接口

3. **我的园本课程页面** (`frontend/src/views/MyCurriculum.vue`)
   - 实现方案列表展示
   - 实现编辑、删除功能
   - 实现实施记录上传

### 优先级 2：完善后端功能

1. **JWT 认证完善**
   - 实现 token 解析中间件
   - 添加路由守卫

2. **文件上传**
   - 集成阿里云 OSS 或本地存储
   - 实现图片/文档上传接口

3. **AI 调用优化**
   - 添加流式输出支持
   - 添加调用限流

### 优先级 3：测试与优化

1. **单元测试**
   - 后端接口测试
   - 前端组件测试

2. **性能优化**
   - 数据库查询优化
   - 前端加载优化

3. **安全加固**
   - 输入校验
   - XSS 防护
   - CSRF 防护

---

## 开发规范

### 后端

- 使用 Type Hints 提高代码可读性
- 所有 API 接口添加 Pydantic 模型校验
- 数据库操作使用 async/await
- 错误处理统一格式

### 前端

- 组件命名使用 PascalCase
- 使用 Composition API（`<script setup>`）
- 样式使用 scoped
- API 调用统一通过 `src/api/` 目录

### Git 提交规范

```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试相关
chore: 构建/工具更新
```

---

## 常见问题

### Q: 如何重置数据库？

```bash
docker compose down -v  # 删除数据卷
docker compose up -d    # 重新启动
docker compose exec api alembic upgrade head  # 重新迁移
```

### Q: 如何查看后端日志？

```bash
docker compose logs -f api
```

### Q: 如何调试前端？

```bash
cd frontend
npm run dev  # 启动开发服务器，支持热更新
```

---

## 技术支持

如有问题，请查看：
- API 文档: http://localhost:8000/docs
- 数据库: `docker compose exec db psql -U postgres -d curriculum`
- 后端容器: `docker compose exec api bash`
- 前端容器: `docker compose exec web sh`
