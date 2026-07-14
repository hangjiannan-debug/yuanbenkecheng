# API 接入实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将火山引擎 Deepseek-v4-pro API 接入园本课程建设平台，实现「一键生成方案」和「教案/资源包生成」的真实 AI 调用。

**Architecture:** 前端模板秒出框架 → 后台异步调用 Python 代理 `/api/chat` → 代理转发到火山引擎 API → 返回后替换模板内容。API Key 存储在 `.env` 中，不进入前端代码。

**Tech Stack:** 原生 JavaScript (fetch) + Python 标准库 (http.server) + 火山引擎 OpenAI 兼容 API

---

## 文件规划

| 文件 | 操作 | 职责 |
|------|------|------|
| `server.py` | 新建 | Python HTTP 服务器：静态文件 + `/api/chat` 代理 |
| `.env` | 新建 | API Key 存储（不入版本控制） |
| `.env.example` | 新建 | `.env` 模板文件 |
| `.gitignore` | 新建 | 忽略 `.env` |
| `api.js` | 新建 | 前端 API 调用模块 |
| `main.js` | 修改 | 集成 `callAI()` 到 `generateAndSavePlan()` 和 `doGenerate()` |
| `index.html` | 修改 | 引入 `api.js` |
| `app.html` | 修改 | 引入 `api.js` |

---

### Task 1: 创建 .env 和 .env.example

**Files:**
- Create: `d:\webProject\yuanbenkecheng\.env`
- Create: `d:\webProject\yuanbenkecheng\.env.example`

- [ ] **Step 1: 创建 .env.example**

```bash
# 火山引擎 API 配置
ARK_API_KEY=your-api-key-here
ARK_BASE_URL=https://ark.cn-beijing.volces.com/api/coding/v3
ARK_MODEL=Deepseek-v4-pro
```

- [ ] **Step 2: 创建 .env（填入真实 Key）**

```bash
# 火山引擎 API 配置
ARK_API_KEY=your-api-key-here
ARK_BASE_URL=https://ark.cn-beijing.volces.com/api/coding/v3
ARK_MODEL=Deepseek-v4-pro
```

- [ ] **Step 3: 验证 .env 可读**

```
python -c "import os; from dotenv import load_dotenv; load_dotenv(); print('OK' if os.getenv('ARK_API_KEY') else 'FAIL')"
```

Expected: 需先 `pip install python-dotenv`（见 Task 2）

---

### Task 2: 创建 server.py

**Files:**
- Create: `d:\webProject\yuanbenkecheng\server.py`

- [ ] **Step 1: 创建 server.py**

```python
#!/usr/bin/env python3
"""
园本课程建设平台 · 开发服务器
- 提供静态文件服务
- /api/chat 代理到火山引擎 Deepseek-v4-pro
"""
import http.server
import json
import os
import urllib.request
import urllib.error
import ssl

# 读取 .env 文件
def load_env(path='.env'):
    env = {}
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, _, val = line.partition('=')
                    env[key.strip()] = val.strip()
    return env

ENV = load_env()
API_KEY = ENV.get('ARK_API_KEY', '')
BASE_URL = ENV.get('ARK_BASE_URL', 'https://ark.cn-beijing.volces.com/api/coding/v3')
MODEL = ENV.get('ARK_MODEL', 'Deepseek-v4-pro')

class APIHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/api/chat':
            self.handle_chat()
        else:
            self.send_error(404)

    def handle_chat(self):
        try:
            length = int(self.headers.get('Content-Length', 0))
            body = json.loads(self.rfile.read(length).decode('utf-8'))

            messages = body.get('messages', [])
            temperature = body.get('temperature', 0.7)
            max_tokens = body.get('max_tokens', 4096)

            req_data = json.dumps({
                'model': MODEL,
                'messages': messages,
                'temperature': temperature,
                'max_tokens': max_tokens
            }).encode('utf-8')

            url = BASE_URL.rstrip('/') + '/chat/completions'
            req = urllib.request.Request(url, data=req_data)
            req.add_header('Content-Type', 'application/json')
            req.add_header('Authorization', f'Bearer {API_KEY}')

            # 忽略 SSL 验证（开发环境）
            ctx = ssl.create_default_context()
            resp = urllib.request.urlopen(req, context=ctx, timeout=120)
            result = json.loads(resp.read().decode('utf-8'))

            content = ''
            if 'choices' in result and len(result['choices']) > 0:
                content = result['choices'][0]['message'].get('content', '')

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'content': content, 'success': True}).encode('utf-8'))

        except urllib.error.HTTPError as e:
            err_body = e.read().decode('utf-8') if e.fp else ''
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({
                'success': False,
                'error': f'API 返回错误 {e.code}: {err_body[:200]}'
            }).encode('utf-8'))

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({
                'success': False,
                'error': str(e)
            }).encode('utf-8'))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 8080))
    server = http.server.HTTPServer(('0.0.0.0', PORT), APIHandler)
    print(f'🚀 服务器启动: http://0.0.0.0:{PORT}')
    print(f'📡 API 代理: {BASE_URL}/chat/completions')
    print(f'🤖 模型: {MODEL}')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\n👋 服务器已停止')
        server.server_close()
```

- [ ] **Step 2: 测试服务器启动**

```
python server.py
```

Expected: 输出 `🚀 服务器启动: http://0.0.0.0:8080`

- [ ] **Step 3: 测试静态文件服务**

```
Invoke-WebRequest -Uri http://localhost:8080/index.html -UseBasicParsing | Select-Object StatusCode
```

Expected: `200`

- [ ] **Step 4: 测试 /api/chat 端点**

```powershell
$body = '{"messages":[{"role":"user","content":"你好"}],"max_tokens":50}'
Invoke-WebRequest -Uri http://localhost:8080/api/chat -Method POST -Body $body -ContentType "application/json" | Select-Object StatusCode
```

Expected: `200`，返回 JSON 含 `content` 字段

---

### Task 3: 创建 .gitignore

**Files:**
- Create: `d:\webProject\yuanbenkecheng\.gitignore`

- [ ] **Step 1: 创建 .gitignore**

```
# 环境变量（含 API Key）
.env

# Python
__pycache__/
*.pyc

# 系统文件
.DS_Store
Thumbs.db
```

---

### Task 4: 创建 api.js

**Files:**
- Create: `d:\webProject\yuanbenkecheng\api.js`

- [ ] **Step 1: 创建 api.js**

```javascript
/**
 * 园本课程建设平台 · API 调用模块
 * 通过 /api/chat 代理调用火山引擎 Deepseek-v4-pro
 */

const AI_CONFIG = {
  endpoint: '/api/chat',
  model: 'Deepseek-v4-pro',
  maxTokens: 4096,
  temperature: 0.7
};

/**
 * 调用 AI 生成内容
 * @param {string} systemPrompt - 系统提示词
 * @param {string} userPrompt - 用户提示词
 * @returns {Promise<{success: boolean, content: string, error: string}>}
 */
async function callAI(systemPrompt, userPrompt) {
  const messages = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: userPrompt });

  try {
    const response = await fetch(AI_CONFIG.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: messages,
        max_tokens: AI_CONFIG.maxTokens,
        temperature: AI_CONFIG.temperature
      })
    });

    if (!response.ok) {
      return { success: false, content: '', error: '服务器返回错误: ' + response.status };
    }

    const result = await response.json();
    if (result.success && result.content) {
      return { success: true, content: result.content, error: '' };
    } else {
      return { success: false, content: '', error: result.error || '未知错误' };
    }
  } catch (e) {
    return { success: false, content: '', error: '网络请求失败: ' + e.message };
  }
}

/**
 * 生成园本课程方案的 System Prompt
 * @param {object} data - 园所表单数据
 * @returns {string}
 */
function buildPlanSystemPrompt(data) {
  return `你是一位资深的幼儿园课程专家，擅长为幼儿园设计专业、科学、可落地的园本课程方案。

请根据以下园所信息，生成一份完整的园本课程方案。方案需包含七大章节，以完整的 HTML 格式输出。

## 园所信息
- 园所名称：${data.name}
- 所在地：${data.location}
- 办园性质：${data.type}
- 班级数：${data.classCount}，幼儿数：${data.studentCount}
- 特色方向：${data.features}
- 地域资源：${data.resources}
- 培养目标：${data.goals}
- 发展规划：${data.plans}
- 园内微环境：${data.microEnv}
- 周边300米资源：${data.nearby}
- 教师风格：${data.teacherStyle || '表达型'}
- 幼儿特点：${data.childStyle || ''}
- 家长特点：${data.parentStyle || ''}

## 输出要求
1. 以完整 HTML 格式输出（从 <!DOCTYPE html> 开始），可直接在浏览器中打开
2. 包含以下七大章节，每个章节标题使用 <h3 class="doc-section-title"><span class="doc-num">N</span>章节名</h3> 格式：
   - 一、课程起源（从园所真实情境出发，包含一个具体的教育故事或发现）
   - 二、课程理念与框架（核心理念、课程主张、课程框架）
   - 三、课程目标（总目标、领域目标、年龄段目标）
   - 四、课程内容（课程模块、资源利用、主题规划）
   - 五、课程实施（环境创设、一日流程、教学策略、家园共育）
   - 六、课程评价（评价理念、幼儿发展评价表、教师评价表、课程评审表、家园共育评价表）
   - 七、课程保障（组织、制度、师资、资源保障）
3. 封面使用 <div class="doc-cover"> 包含园所名称和课程名称
4. 使用 <table class="doc-table"> 格式输出所有表格
5. 使用 <div class="module-cards"><div class="module-card"> 格式输出课程模块
6. 使用 <div class="flow-diagram"><div class="flow-node"> 格式输出年龄段进阶图
7. 使用 <div class="resource-map"><div class="rm-item"> 格式输出资源地图

## 关键约束
- 禁止套用通用模板句式，每句话需体现该园所的具体特征
- 园内微环境、周边资源需在方案中有明确体现
- 教师风格和幼儿特点需融入教学策略章节
- 家长特点需融入家园共育章节
- 方案需要专业、科学、可落地，同时具有可读性`;
}

/**
 * 生成教案/资源包的 System Prompt
 * @param {object} plan - 课程方案对象
 * @param {string} type - 'weekly_plan' 或 'resource_pack'
 * @param {string} ageGroup - 年龄段
 * @param {string} theme - 主题名称
 * @returns {string}
 */
function buildContentSystemPrompt(plan, type, ageGroup, theme) {
  const typeName = type === 'weekly_plan' ? '周教学计划' : '主题资源包';
  return `你是一位资深的幼儿园教师，擅长为园本课程设计具体的教学计划和资源包。

请根据以下园所课程方案信息，生成一份${ageGroup}的"${theme}"${typeName}。

## 课程方案背景
- 园所名称：${plan.name}
- 特色方向：${plan.fw || ''}
- 地域资源：${plan.rw || ''}
- 培养目标：${plan.gw || ''}

## 输出要求
${type === 'weekly_plan' ? `1. 以 HTML 表格格式输出周一到周五的教学计划
2. 每行包含：日期、活动名称、活动目标（认知/技能/情感）、材料准备、活动流程（导入/展开/结束）、延伸建议
3. 表格底部添加本周观察要点
4. 活动名称和内容需体现园所特色，不可套用通用模板` : `1. 以 HTML 格式输出主题资源包
2. 包含：绘本推荐（4本）、游戏方案（4个）、环境创设建议、家园共育建议
3. 每项内容需体现园所特色和地域资源，不可套用通用模板`}`;
}

/**
 * 显示 AI 状态指示器
 * @param {string} containerId - 容器元素 ID
 * @param {string} status - 'loading' | 'success' | 'error'
 * @param {string} message - 提示文字
 * @param {Function} retryFn - 重试回调（仅 error 状态需要）
 */
function showAIStatus(containerId, status, message, retryFn) {
  const container = document.getElementById(containerId);
  if (!container) return;
  let statusEl = container.querySelector('.ai-status-bar');
  if (!statusEl) {
    statusEl = document.createElement('div');
    statusEl.className = 'ai-status-bar';
    container.insertBefore(statusEl, container.firstChild);
  }
  const colors = { loading: '#e3f2fd', success: '#e8f5e9', error: '#fff3e0' };
  const icons = { loading: '✨', success: '✅', error: '⚠️' };
  statusEl.style.cssText = 'padding:10px 16px;margin-bottom:12px;border-radius:8px;font-size:13px;display:flex;align-items:center;gap:8px;';
  statusEl.style.background = colors[status] || '#f5f5f5';

  let retryBtn = '';
  if (status === 'error' && retryFn) {
    retryBtn = '<button onclick="(' + retryFn.toString() + ')()" style="margin-left:auto;padding:4px 12px;border:1px solid #e65100;background:#fff;border-radius:4px;cursor:pointer;font-size:12px;color:#e65100;">🔄 重试</button>';
  }
  statusEl.innerHTML = icons[status] + ' ' + message + retryBtn;

  if (status === 'success') {
    setTimeout(function() { if (statusEl.parentNode) statusEl.remove(); }, 3000);
  }
}
```

- [ ] **Step 2: 验证 api.js 语法**

```
node -c api.js
```

Expected: 无输出（无语法错误）

---

### Task 5: 修改 main.js — 集成 API 调用

**Files:**
- Modify: `d:\webProject\yuanbenkecheng\main.js`

- [ ] **Step 1: 修改 generateAndSavePlan() — 添加 API 异步优化**

定位 `main.js` 第 1675 行 `async function generateAndSavePlan()`，将函数体修改为：

```javascript
async function generateAndSavePlan() {
  const data = state.formData;
  const user = getCurrentUser();
  if (!user) { alert('请先登录'); return; }
  const fw = getFeatureWord(data);
  const rw = getResourceWord(data);
  const gw = getGoalWord(data);

  // Step 1: 用模板秒出框架
  const htmlContent = buildCurriculumDoc(data);

  // Step 2: 立即保存模板版本并展示
  let planId;
  try {
    planId = await dbAdd('curriculum_plans', {
      kinderId: user.kinderId, name: data.name, fw, rw, gw,
      formData: JSON.parse(JSON.stringify(data)),
      htmlContent: htmlContent,
      aiOptimized: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  } catch (e) {
    alert('保存失败：' + e.message);
    return;
  }

  alert('园本课程方案已生成！AI 正在后台优化方案，可前往「我的园本课程」查看。');

  // Step 3: 后台异步调用 API 优化
  try {
    const systemPrompt = buildPlanSystemPrompt(data);
    const userPrompt = '请根据以上园所信息，生成一份完整的园本课程方案。';
    const result = await callAI(systemPrompt, userPrompt);

    if (result.success && result.content) {
      // 提取 AI 返回的 HTML 内容
      let aiHtml = result.content;
      // 如果 AI 返回了完整 HTML，提取 body 中的 curriculum-doc 部分
      var docMatch = aiHtml.match(/<div class="curriculum-doc"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/body>/i);
      if (!docMatch) {
        docMatch = aiHtml.match(/<div class="curriculum-doc"[^>]*>([\s\S]*?)<\/div>\s*$/i);
      }
      if (docMatch) {
        aiHtml = '<div class="curriculum-doc" style="max-width:100%;margin:0;">' + docMatch[1] + '</div>';
      }
      // 更新 IndexedDB 中的方案
      await dbPut('curriculum_plans', {
        id: planId, kinderId: user.kinderId, name: data.name, fw, rw, gw,
        formData: JSON.parse(JSON.stringify(data)),
        htmlContent: aiHtml,
        aiOptimized: true,
        createdAt: (await dbGet('curriculum_plans', planId)).createdAt,
        updatedAt: new Date().toISOString()
      });
      console.log('✅ AI 优化完成，方案已更新');
    } else {
      console.log('⚠️ AI 优化失败，保留模板版本: ' + result.error);
    }
  } catch (e) {
    console.log('⚠️ AI 优化异常: ' + e.message);
  }

  // 跳转到我的园本课程
  if (typeof switchTab === 'function') {
    switchTab('my-courses');
  }
}
```

- [ ] **Step 2: 修改 doGenerate() — 添加 API 异步优化**

定位 `main.js` 第 3227 行 `async function doGenerate()`，在函数末尾（`resultEl.innerHTML = ...` 之后）添加 API 异步调用逻辑。找到 `resultEl.innerHTML = \`...\`;` 这行（约第 3241 行），在其后添加：

```javascript
  // 异步调用 AI 优化
  const genContainerId = 'genResultContainer_' + Date.now();
  resultEl.querySelector('.gen-result-card').id = genContainerId;

  showAIStatus(genContainerId, 'loading', 'AI 正在优化内容，请稍候...');

  (async function() {
    try {
      const systemPrompt = buildContentSystemPrompt(plan, type, ageGroup, theme);
      const userPrompt = type === 'weekly_plan'
        ? '请生成' + ageGroup + '的"' + theme + '"周教学计划（第' + week + '周），以 HTML 表格格式输出。'
        : '请生成' + ageGroup + '的"' + theme + '"主题资源包，以 HTML 格式输出。';

      const result = await callAI(systemPrompt, userPrompt);

      if (result.success && result.content) {
        var aiHtml = result.content;
        // 提取有用的 HTML 内容
        var tableMatch = aiHtml.match(/<table[\s\S]*?<\/table>/i);
        var previewEl = document.getElementById(genContainerId);
        if (previewEl && tableMatch) {
          var contentPreview = previewEl.querySelector('.gen-content-preview');
          if (contentPreview) {
            contentPreview.innerHTML = tableMatch[0];
            // 添加 AI 优化标识
            var badge = document.createElement('span');
            badge.style.cssText = 'display:inline-block;background:#e8f5e9;color:#2e7d32;padding:2px 8px;border-radius:4px;font-size:11px;margin-left:8px;';
            badge.textContent = 'AI 优化版';
            var h4 = previewEl.querySelector('h4');
            if (h4 && !h4.querySelector('.ai-badge')) { h4.appendChild(badge); badge.className = 'ai-badge'; }
            showAIStatus(genContainerId, 'success', 'AI 优化完成');
          }
        }
      } else {
        showAIStatus(genContainerId, 'error', 'AI 服务暂时不可用，当前为模板版本', function() {
          doGenerate();
        });
      }
    } catch (e) {
      showAIStatus(genContainerId, 'error', 'AI 服务暂时不可用: ' + e.message, function() {
        doGenerate();
      });
    }
  })();
```

- [ ] **Step 3: 检查新增代码无语法错误**

打开浏览器控制台，执行 `generateAndSavePlan` 和 `doGenerate` 不应报语法错误。

---

### Task 6: 在 HTML 文件中引入 api.js

**Files:**
- Modify: `d:\webProject\yuanbenkecheng\index.html`
- Modify: `d:\webProject\yuanbenkecheng\app.html`

- [ ] **Step 1: 修改 index.html**

在 `index.html` 中 `main.js` 引用之前添加 `api.js`：

```html
<script src="api.js"></script>
<script src="main.js"></script>
```

定位到 `index.html` 第 73 行附近，`<script src="main.js"></script>` 之前插入 `<script src="api.js"></script>`。

- [ ] **Step 2: 修改 app.html**

在 `app.html` 中 `main.js` 引用之前添加 `api.js`：

```html
<script src="api.js"></script>
<script src="main.js"></script>
```

定位到 `app.html` 第 95 行附近，`<script src="main.js"></script>` 之前插入 `<script src="api.js"></script>`。

- [ ] **Step 3: 验证页面加载**

```
Invoke-WebRequest -Uri http://localhost:8080/index.html -UseBasicParsing | Select-Object StatusCode
Invoke-WebRequest -Uri http://localhost:8080/app.html -UseBasicParsing | Select-Object StatusCode
```

Expected: 两个都返回 `200`

---

### Task 7: 端到端测试

**Files:**
- Test: 浏览器手动测试

- [ ] **Step 1: 停止旧服务器，启动新服务器**

先停止当前 `python -m http.server` 进程，然后：

```
python server.py
```

Expected: `🚀 服务器启动: http://0.0.0.0:8080`

- [ ] **Step 2: 测试 API 代理连通性**

```powershell
$body = '{"messages":[{"role":"user","content":"用一句话介绍自己"}],"max_tokens":100}'
$resp = Invoke-WebRequest -Uri http://localhost:8080/api/chat -Method POST -Body $body -ContentType "application/json" | ConvertFrom-Json
$resp.success
$resp.content
```

Expected: `True` 且有实际的 AI 回复内容

- [ ] **Step 3: 前端集成测试**

1. 打开 `http://localhost:8080`
2. 园长登录
3. 在「园本课程建设」中填写园所信息并走完 9 步流程
4. 在报告汇总页点击「生成园本课程方案」
5. 查看浏览器控制台，应出现 `✅ AI 优化完成`
6. 前往「我的园本课程」，查看方案详情——应显示 AI 优化后的内容
7. 切换到「课程生成」，生成教案或资源包
8. 确认页面出现 `AI 优化版` 标识

- [ ] **Step 4: 测试降级策略**

临时修改 `.env` 中的 `ARK_API_KEY` 为无效值，重启服务器，重复 Step 3 中的生成操作。应看到：
- 模板版本正常展示
- 状态条显示 `⚠️ AI 服务暂时不可用`
- 「重试」按钮可点击

测试完成后恢复正确的 API Key。

- [ ] **Step 5: 提交代码**

```bash
git add server.py .env.example .gitignore api.js
git add index.html app.html main.js
git commit -m "feat: 接入火山引擎 Deepseek-v4-pro API，实现方案和教案的真实 AI 生成"
```

注意：`.env` 不在提交范围内（已通过 `.gitignore` 排除）。
