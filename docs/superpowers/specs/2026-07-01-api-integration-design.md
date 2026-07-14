# 园本课程建设平台 · API 接入设计方案

## 背景

当前平台所有"AI 专家"功能均为硬编码模板 + 变量替换，无真实 LLM 调用。现需接入火山引擎 Deepseek-v4-pro API，使平台成为可演示的真实 AI 工具。

## API 信息

- **端点**: `https://ark.cn-beijing.volces.com/api/coding/v3`（兼容 OpenAI 协议）
- **模型**: `Deepseek-v4-pro`
- **协议**: OpenAI Chat Completions (`/v3/chat/completions`)

## 改造范围（决策 C）

仅以下两个环节调用真实 API，其余保持现有模板：

| 环节 | 触发位置 | 说明 |
|------|----------|------|
| 一键生成园本课程方案 | `buildCurriculumDoc()` / `generateAndSavePlan()` | 模板秒出框架 → 后台 API 生成深度个性化版本 → 无缝替换 |
| 教案/资源包生成 | `generateWeeklyPlan()` / `generateResourcePack()` | 同上流程 |

9 步 AI 专家流程、报告汇总、打字动画等保持现有模板实现。

## 交互体验（决策 C：混合模式）

```
用户点击"生成方案"
  → Step 1: 模板即时渲染，页面立即可见（< 100ms）
  → Step 2: 显示状态条 "✨ AI 正在优化方案..."
  → Step 3: 后台调用 API（10-30s）
  → Step 4: API 返回后，替换为 AI 版本
  → Step 5: 状态条变为 "✅ AI 优化完成"
```

## 降级策略（决策 B）

API 调用失败时：
- 状态条变为 "⚠️ AI 服务暂时不可用，当前为模板版本"
- 保留模板内容不替换
- 提供"重试"按钮，允许手动重新调用

## API Key 安全（决策 B：Python 代理）

### 架构

```
浏览器 (前端 JS)
    │  POST /api/chat
    ▼
server.py (Python HTTP 服务器)
    │  读取 .env 中的 API_KEY
    │  POST https://ark.cn-beijing.volces.com/api/coding/v3/chat/completions
    ▼
火山引擎 Deepseek-v4-pro
```

### 文件清单

| 文件 | 类型 | 职责 |
|------|------|------|
| `server.py` | 新增 | Python HTTP 服务器，同时提供静态文件服务和 `/api/chat` 代理端点 |
| `.env` | 新增 | 存储 `API_KEY=ark-xxx`，不提交版本控制 |
| `.env.example` | 新增 | `.env` 模板文件，供部署参考 |
| `.gitignore` | 修改 | 添加 `.env` |
| `api.js` | 新增 | 前端 API 调用模块，封装 fetch + 状态管理 + 降级逻辑 |
| `main.js` | 修改 | 在 `generateAndSavePlan()` 和 `doGenerate()` 中集成 `api.js` |

### server.py 设计

- 基于 Python 标准库 `http.server`，无需额外安装依赖
- 默认提供静态文件服务（替代 `python -m http.server`）
- `/api/chat` 端点：接收 POST JSON `{ model, messages, max_tokens, temperature }`，转发到火山引擎
- 从 `.env` 读取 `API_KEY`，通过 `Authorization: Bearer` 头传递
- 启动命令：`python server.py`（默认端口 8080）

### api.js 设计

```javascript
// 核心函数
async function callAI(systemPrompt, userPrompt) → { html, success, error }

// 内部流程
1. 构建 messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }]
2. POST /api/chat
3. 解析响应，提取 content
4. 失败时返回 success: false + error 信息
```

### System Prompt 设计要点

- 注入园所完整信息（名称、特色词、资源词、目标词、教师风格、幼儿特点、家长画像、微观环境、周边资源）
- 要求输出完整 HTML 格式的园本课程方案
- 七大章节结构：课程起源 → 课程理念 → 课程目标 → 课程内容 → 课程实施 → 课程评价 → 课程保障
- **关键约束**：禁止套用通用模板句式，每句话需体现该园所的具体特征
- 阅读馆、奥林匹克公园、鸟巢、水立方等具体资源需在方案中有明确体现
- A 班活跃型 / B 班安静型幼儿的差异化策略需写入方案
- 表达型教师和高知家长的特征需融入教学策略和家园共育章节

### 前端集成点

在 `main.js` 中修改两处：

1. **`generateAndSavePlan()`**：生成模板 → 展示 → 异步调用 `callAI()` → 替换
2. **`doGenerate()`**：生成模板 → 展示 → 异步调用 `callAI()` → 替换

### 状态管理

在方案/教案展示区域顶部添加状态指示器：
- 初始状态：无指示器（模板版本）
- 调用中：蓝色 "✨ AI 正在优化方案，请稍候..."
- 成功：绿色 "✅ AI 优化完成"（3 秒后自动消失）
- 失败：橙色 "⚠️ AI 服务暂时不可用，当前为模板版本 [重试]"

## 不改造的部分

- 9 步 AI 专家流程（step1-step9）：保持现有模板
- 打字动画效果：保持现有实现
- Chat/Option/Annotate 交互模式：保持现有实现
- 报告汇总页（step10）：保持现有聚合逻辑
- IndexedDB 存储：保持现有结构
- 用户认证：保持现有实现

## 部署说明

1. 复制 `.env.example` 为 `.env`，填入真实 API Key
2. 运行 `python server.py`（替代 `python -m http.server 8080`）
3. 访问 `http://localhost:8080` 或内网 IP
