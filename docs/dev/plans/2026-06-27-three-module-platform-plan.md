# 园本课程建设平台 · 三版块架构实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将现有单页工具升级为三版块平台（园本课程建设/课程生成/我的园本课程），引入园长-教师账号体系，数据按园所隔离，纯前端 IndexedDB 存储。

**Architecture:** 新增 `db.js`（IndexedDB 封装）、`auth.js`（登录注册逻辑）、`app.html`（三版块主应用），改造 `index.html` 为欢迎页+登录页，`main.js` 保留核心逻辑并增加方案存储、课程生成、实施记录功能。

**Tech Stack:** HTML + CSS + JS（纯前端），IndexedDB，无外部依赖

**Source Spec:** `docs/superpowers/specs/2026-06-27-three-module-platform-design.md`

---

## 文件结构总览

| 文件 | 操作 | 职责 |
|------|------|------|
| `db.js` | 新建 | IndexedDB 封装（5张表 CRUD） |
| `auth.js` | 新建 | 登录/注册/登出/会话管理 |
| `index.html` | 修改 | 欢迎页 + 登录/注册表单 |
| `app.html` | 新建 | 三版块主应用框架 |
| `main.js` | 修改 | 保留核心逻辑 + 增加方案存储、课程生成、实施记录 |
| `styles.css` | 修改 | 新增登录页、三版块导航、方案管理、课程生成、实施记录样式 |

---

### Task 1: IndexedDB 封装层

**Files:**
- Create: `d:\webProject\yuanbenkecheng\db.js`

- [ ] **Step 1: 创建 db.js，实现数据库初始化与 CRUD**

```js
// db.js - IndexedDB 封装层
const DB_NAME = 'yuanbenkecheng_db';
const DB_VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('kinders')) {
        db.createObjectStore('kinders', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('accounts')) {
        const store = db.createObjectStore('accounts', { keyPath: 'id', autoIncrement: true });
        store.createIndex('phone', 'phone', { unique: true });
        store.createIndex('kinderId', 'kinderId', { unique: false });
      }
      if (!db.objectStoreNames.contains('curriculum_plans')) {
        const store = db.createObjectStore('curriculum_plans', { keyPath: 'id', autoIncrement: true });
        store.createIndex('kinderId', 'kinderId', { unique: false });
      }
      if (!db.objectStoreNames.contains('course_contents')) {
        const store = db.createObjectStore('course_contents', { keyPath: 'id', autoIncrement: true });
        store.createIndex('planId', 'planId', { unique: false });
        store.createIndex('kinderId', 'kinderId', { unique: false });
      }
      if (!db.objectStoreNames.contains('implementation_records')) {
        const store = db.createObjectStore('implementation_records', { keyPath: 'id', autoIncrement: true });
        store.createIndex('planId', 'planId', { unique: false });
        store.createIndex('kinderId', 'kinderId', { unique: false });
        store.createIndex('type', 'type', { unique: false });
      }
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e.target.error);
  });
}

function dbAdd(storeName, item) {
  return openDB().then(db => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.add(item);
      req.onsuccess = (e) => resolve(e.target.result);
      req.onerror = (e) => reject(e.target.error);
    });
  });
}

function dbPut(storeName, item) {
  return openDB().then(db => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.put(item);
      req.onsuccess = (e) => resolve(e.target.result);
      req.onerror = (e) => reject(e.target.error);
    });
  });
}

function dbGet(storeName, id) {
  return openDB().then(db => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.get(id);
      req.onsuccess = (e) => resolve(e.target.result);
      req.onerror = (e) => reject(e.target.error);
    });
  });
}

function dbGetAll(storeName) {
  return openDB().then(db => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = (e) => resolve(e.target.result || []);
      req.onerror = (e) => reject(e.target.error);
    });
  });
}

function dbGetByIndex(storeName, indexName, value) {
  return openDB().then(db => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const index = store.index(indexName);
      const req = index.getAll(value);
      req.onsuccess = (e) => resolve(e.target.result || []);
      req.onerror = (e) => reject(e.target.error);
    });
  });
}

function dbDelete(storeName, id) {
  return openDB().then(db => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = (e) => reject(e.target.error);
    });
  });
}
```

---

### Task 2: 登录注册逻辑

**Files:**
- Create: `d:\webProject\yuanbenkecheng\auth.js`

- [ ] **Step 1: 创建 auth.js，实现注册、登录、登出、会话管理**

```js
// auth.js - 登录/注册/会话管理
const AUTH_KEY = 'ybkc_current_user';

async function registerPrincipal(name, phone, password, kinderName) {
  const existing = await dbGetByIndex('accounts', 'phone', phone);
  if (existing.length > 0) throw new Error('该手机号已注册');
  const kinderId = await dbAdd('kinders', { name: kinderName, createdAt: new Date().toISOString() });
  const accountId = await dbAdd('accounts', {
    role: 'principal', name, phone, password, kinderId, createdAt: new Date().toISOString()
  });
  return { id: accountId, role: 'principal', name, phone, kinderId };
}

async function createTeacher(name, phone, password, kinderId) {
  const existing = await dbGetByIndex('accounts', 'phone', phone);
  if (existing.length > 0) throw new Error('该手机号已存在');
  return dbAdd('accounts', {
    role: 'teacher', name, phone, password, kinderId, createdAt: new Date().toISOString()
  });
}

async function login(phone, password) {
  const accounts = await dbGetByIndex('accounts', 'phone', phone);
  if (accounts.length === 0) throw new Error('账号不存在');
  const account = accounts[0];
  if (account.password !== password) throw new Error('密码错误');
  const kinder = await dbGet('kinders', account.kinderId);
  const user = {
    id: account.id, role: account.role, name: account.name,
    phone: account.phone, kinderId: account.kinderId,
    kinderName: kinder ? kinder.name : ''
  };
  sessionStorage.setItem(AUTH_KEY, JSON.stringify(user));
  return user;
}

function getCurrentUser() {
  const raw = sessionStorage.getItem(AUTH_KEY);
  return raw ? JSON.parse(raw) : null;
}

function logout() {
  sessionStorage.removeItem(AUTH_KEY);
  window.location.href = '/';
}

function requireAuth() {
  const user = getCurrentUser();
  if (!user) { window.location.href = '/'; return null; }
  return user;
}

async function getTeachers(kinderId) {
  const all = await dbGetByIndex('accounts', 'kinderId', kinderId);
  return all.filter(a => a.role === 'teacher');
}
```

---

### Task 3: 改造 index.html 为欢迎页+登录页

**Files:**
- Modify: `d:\webProject\yuanbenkecheng\index.html`

- [ ] **Step 1: 在 index.html 头部引入 db.js 和 auth.js**

在 `<link rel="stylesheet" href="styles.css">` 之后添加：
```html
<script src="db.js"></script>
<script src="auth.js"></script>
```

- [ ] **Step 2: 替换 body 内容为欢迎页+登录/注册切换**

保留现有 `<div class="welcome-overlay">` 的欢迎卡片，在其后增加登录/注册面板。完整替换 body 内容为：

```html
<body>
<!-- 欢迎页 -->
<div class="welcome-overlay" id="welcomeOverlay">
  <div class="welcome-card">
    <div class="welcome-icon">🌳</div>
    <h1>园本课程建设平台</h1>
    <p class="subtitle">AI驻园专家 · 引领园本课程建设全流程</p>
    <p class="tagline">园长建设课程 · 教师生成课程 · 记录沉淀成长</p>
    <div class="welcome-features">
      <span>📋 园本课程建设</span><span>📝 课程生成</span><span>📂 我的园本课程</span>
    </div>
    <button class="btn btn-primary" onclick="showLogin()" style="font-size:16px;padding:14px 40px;">
      进入平台 →
    </button>
  </div>
</div>

<!-- 登录/注册面板 -->
<div class="auth-overlay" id="authOverlay" style="display:none;">
  <div class="auth-card" id="authCard">
    <!-- 登录表单 -->
    <div id="loginForm">
      <h2>🔐 登录</h2>
      <div class="form-group">
        <label>手机号</label>
        <input type="text" id="loginPhone" placeholder="请输入手机号">
      </div>
      <div class="form-group">
        <label>密码</label>
        <input type="password" id="loginPwd" placeholder="请输入密码">
      </div>
      <p class="auth-error" id="loginError" style="display:none;color:#e74c3c;"></p>
      <button class="btn btn-primary" onclick="doLogin()" style="width:100%;">登录</button>
      <p class="auth-switch">还没有账号？<a href="javascript:void(0)" onclick="showRegister()">园长注册</a></p>
    </div>
    <!-- 注册表单（仅园长） -->
    <div id="registerForm" style="display:none;">
      <h2>📝 园长注册</h2>
      <div class="form-group">
        <label>园所名称</label>
        <input type="text" id="regKinder" placeholder="请输入园所全称">
      </div>
      <div class="form-group">
        <label>园长姓名</label>
        <input type="text" id="regName" placeholder="请输入姓名">
      </div>
      <div class="form-group">
        <label>手机号</label>
        <input type="text" id="regPhone" placeholder="请输入手机号">
      </div>
      <div class="form-group">
        <label>密码</label>
        <input type="password" id="regPwd" placeholder="请设置密码（6位以上）">
      </div>
      <p class="auth-error" id="regError" style="display:none;color:#e74c3c;"></p>
      <button class="btn btn-primary" onclick="doRegister()" style="width:100%;">注册</button>
      <p class="auth-switch">已有账号？<a href="javascript:void(0)" onclick="showLogin()">返回登录</a></p>
    </div>
  </div>
</div>

<script src="main.js"></script>
</body>
```

- [ ] **Step 3: 在 main.js 末尾添加登录/注册交互函数**

```js
// ========== Auth UI ==========
function showLogin() {
  document.getElementById('welcomeOverlay').style.display = 'none';
  document.getElementById('authOverlay').style.display = 'flex';
  document.getElementById('loginForm').style.display = 'block';
  document.getElementById('registerForm').style.display = 'none';
}

function showRegister() {
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('registerForm').style.display = 'block';
}

async function doLogin() {
  const phone = document.getElementById('loginPhone').value.trim();
  const pwd = document.getElementById('loginPwd').value.trim();
  const errEl = document.getElementById('loginError');
  if (!phone || !pwd) { errEl.textContent = '请填写手机号和密码'; errEl.style.display = 'block'; return; }
  try {
    await login(phone, pwd);
    window.location.href = '/app.html';
  } catch (e) {
    errEl.textContent = e.message;
    errEl.style.display = 'block';
  }
}

async function doRegister() {
  const name = document.getElementById('regName').value.trim();
  const phone = document.getElementById('regPhone').value.trim();
  const pwd = document.getElementById('regPwd').value.trim();
  const kinder = document.getElementById('regKinder').value.trim();
  const errEl = document.getElementById('regError');
  if (!name || !phone || !pwd || !kinder) { errEl.textContent = '请填写所有字段'; errEl.style.display = 'block'; return; }
  if (pwd.length < 6) { errEl.textContent = '密码至少6位'; errEl.style.display = 'block'; return; }
  try {
    await registerPrincipal(name, phone, pwd, kinder);
    await login(phone, pwd);
    window.location.href = '/app.html';
  } catch (e) {
    errEl.textContent = e.message;
    errEl.style.display = 'block';
  }
}
```

---

### Task 4: 创建 app.html 三版块主应用框架

**Files:**
- Create: `d:\webProject\yuanbenkecheng\app.html`

- [ ] **Step 1: 创建 app.html 基础结构**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>园本课程建设平台</title>
<link rel="stylesheet" href="styles.css">
<script src="db.js"></script>
<script src="auth.js"></script>
</head>
<body>

<!-- 顶部导航 -->
<nav class="top-nav" id="topNav">
  <div class="nav-brand">🌳 园本课程建设平台</div>
  <div class="nav-tabs" id="navTabs">
    <button class="nav-tab active" data-tab="construction" onclick="switchTab('construction')">📋 园本课程建设</button>
    <button class="nav-tab" data-tab="generate" onclick="switchTab('generate')">📝 课程生成</button>
    <button class="nav-tab" data-tab="my-courses" onclick="switchTab('my-courses')">📂 我的园本课程</button>
  </div>
  <div class="nav-user">
    <span id="navUserName"></span>
    <div class="nav-dropdown">
      <button class="nav-user-btn" onclick="toggleUserMenu()">▼</button>
      <div class="nav-dropdown-content" id="userMenu" style="display:none;">
        <a href="javascript:void(0)" onclick="showAccountManage()" id="menuAccountManage" style="display:none;">👥 账号管理</a>
        <a href="javascript:void(0)" onclick="logout()">🚪 退出登录</a>
      </div>
    </div>
  </div>
</nav>

<!-- 版块一：园本课程建设 -->
<div class="tab-content active" id="tab-construction">
  <div class="app-container" id="appContainer" style="display:block;">
    <aside class="sidebar">
      <div class="sidebar-logo">
        <div class="logo-text">🌳 园本课程建设</div>
        <div class="logo-sub">AI驻园专家平台</div>
      </div>
      <ul class="step-nav" id="stepNav">
        <li><button onclick="goToStep(0)" data-step="0">
          <span class="step-num">📝</span>
          <span class="step-label">输入信息<small>园所基本情况</small></span>
        </button></li>
        <li><button onclick="goToStep(1)" data-step="1" disabled>
          <span class="step-num">1</span>
          <span class="step-label">园所诊断<small>园所诊断师</small></span>
        </button></li>
        <li><button onclick="goToStep(2)" data-step="2" disabled>
          <span class="step-num">2</span>
          <span class="step-label">政策研究<small>政策研究员</small></span>
        </button></li>
        <li><button onclick="goToStep(3)" data-step="3" disabled>
          <span class="step-num">3</span>
          <span class="step-label">地域挖掘<small>地域文化挖掘师</small></span>
        </button></li>
        <li><button onclick="goToStep(4)" data-step="4" disabled>
          <span class="step-num">4</span>
          <span class="step-label">特色定位<small>特色定位专家组</small></span>
        </button></li>
        <li><button onclick="goToStep(5)" data-step="5" disabled>
          <span class="step-num">5</span>
          <span class="step-label">课程架构<small>课程架构师</small></span>
        </button></li>
        <li><button onclick="goToStep(6)" data-step="6" disabled>
          <span class="step-num">6</span>
          <span class="step-label">课程地图<small>地图设计师</small></span>
        </button></li>
        <li><button onclick="goToStep(7)" data-step="7" disabled>
          <span class="step-num">7</span>
          <span class="step-label">实施方案<small>课程实施专家组</small></span>
        </button></li>
        <li><button onclick="goToStep(8)" data-step="8" disabled>
          <span class="step-num">8</span>
          <span class="step-label">评价体系<small>课程评价专家组</small></span>
        </button></li>
        <li><button onclick="goToStep(9)" data-step="9" disabled>
          <span class="step-num">9</span>
          <span class="step-label">评审委员会<small>课程评审委员会</small></span>
        </button></li>
        <li><button onclick="goToStep(10)" data-step="10" disabled>
          <span class="step-num">📄</span>
          <span class="step-label">报告汇总<small>完整课程体系</small></span>
        </button></li>
      </ul>
    </aside>
    <main class="main-content" id="mainContent">
      <!-- Step 0: Input Form -->
      <div class="step-content active" id="step0">
        <div class="card">
          <div class="card-header">
            <h2>📝 园所信息录入</h2>
            <p class="card-desc">请尽可能详细地填写以下信息，AI驻园专家将基于这些信息为您生成完整的园本课程体系</p>
            <div class="progress-bar"><div class="progress-fill" style="width:0%" id="formProgress"></div></div>
          </div>
          <div class="form-section">
            <div class="form-section-title"><span class="icon">🏫</span> 一、园所基本信息</div>
            <div class="form-grid">
              <div class="form-group"><label>园所名称 <span class="hint">*必填</span></label><input type="text" id="f_name" placeholder="请输入园所全称" oninput="updateFormProgress()"></div>
              <div class="form-group"><label>所在地</label><input type="text" id="f_location" placeholder="省/市/区" oninput="updateFormProgress()"></div>
              <div class="form-group"><label>办园性质</label><select id="f_type" onchange="updateFormProgress()"><option value="">请选择</option><option value="公办">公办</option><option value="民办普惠">民办普惠</option><option value="民办高端">民办高端</option><option value="企业办园">企业办园</option></select></div>
              <div class="form-group"><label>班级数</label><input type="number" id="f_classCount" placeholder="如：12" min="1" oninput="updateFormProgress()"></div>
              <div class="form-group"><label>幼儿数</label><input type="number" id="f_studentCount" placeholder="如：360" min="1" oninput="updateFormProgress()"></div>
            </div>
          </div>
          <div class="form-section">
            <div class="form-section-title"><span class="icon">⭐</span> 二、园所特色</div>
            <div class="form-group full"><textarea id="cf_features" rows="2" placeholder="请输入园所特色方向，多个请用逗号或顿号分隔" oninput="updateFormProgress()"></textarea><div class="input-example">💡 <strong>示例：</strong>自然教育、劳动教育、阅读、足球、非遗、科学教育、艺术、体育</div></div>
          </div>
          <div class="form-section">
            <div class="form-section-title"><span class="icon">🗺️</span> 三、地域资源</div>
            <div class="form-group full"><textarea id="cf_resources" rows="2" placeholder="请输入园所周边可利用的地域资源，多个请用逗号或顿号分隔" oninput="updateFormProgress()"></textarea><div class="input-example">💡 <strong>示例：</strong>茶园、农田、海洋、森林、博物馆、红色基地、河流、山川</div></div>
          </div>
          <div class="form-section">
            <div class="form-section-title"><span class="icon">🎯</span> 四、培养目标</div>
            <div class="form-group full"><textarea id="cf_goals" rows="2" placeholder="请输入园所希望培养的儿童关键品质，多个请用逗号或顿号分隔" oninput="updateFormProgress()"></textarea><div class="input-example">💡 <strong>示例：</strong>健康儿童、自主儿童、探究儿童、创造儿童、友善儿童、自信儿童</div></div>
          </div>
          <div class="form-section">
            <div class="form-section-title"><span class="icon">🚀</span> 五、未来规划</div>
            <div class="form-group full"><textarea id="cf_plans" rows="2" placeholder="请输入园所近期发展目标与规划，多个请用逗号或顿号分隔" oninput="updateFormProgress()"></textarea><div class="input-example">💡 <strong>示例：</strong>创建示范园、课程评比、成果奖、等级评定</div></div>
          </div>
          <div class="form-section">
            <div class="form-section-title"><span class="icon">🔬</span> 六、微观环境补充</div>
            <div class="sub-section"><div class="sub-section-title">（1）园内微环境</div><div class="form-group full"><textarea id="cu_micro_env" rows="2" placeholder="请描述园内的微环境特征，多个请用逗号或顿号分隔" oninput="updateFormProgress()"></textarea><div class="input-example">💡 <strong>示例：</strong>菜园、沙地、水池、坡地、柚子树、桂花树、塑胶操场</div></div></div>
            <div class="sub-section"><div class="sub-section-title">（2）周边300米资源</div><div class="form-group full"><textarea id="cu_nearby" rows="2" placeholder="请描述园所周边300米内的社区资源，多个请用逗号或顿号分隔" oninput="updateFormProgress()"></textarea><div class="input-example">💡 <strong>示例：</strong>社区菜市场、公园、河道、商铺、博物馆、消防站、花店、图书馆</div></div></div>
            <div class="sub-section"><div class="sub-section-title">（3）教师行为画像</div><div class="form-group full"><label>教师风格</label><textarea id="cu_teacher" rows="2" placeholder="请描述园所教师的教学风格特点" oninput="updateFormProgress()"></textarea><div class="input-example">💡 <strong>示例：</strong>（表达型）→ 课程偏向：故事化、角色扮演；（科学型）→ 课程偏向：实验、探究</div></div></div>
            <div class="sub-section"><div class="sub-section-title">（4）幼儿行为画像</div><div class="form-group full"><label>幼儿特点</label><textarea id="cu_child" rows="2" placeholder="请描述园所幼儿的整体行为特点" oninput="updateFormProgress()"></textarea><div class="input-example">💡 <strong>示例：</strong>活跃、喜欢跑跳；安静、喜欢搭建</div></div></div>
          </div>
        </div>
        <div class="step-footer">
          <span class="hint">💡 填写越详细，生成的课程体系越精准</span>
          <button class="btn btn-primary" onclick="submitForm()" id="btnSubmit">提交信息，启动AI诊断 →</button>
        </div>
      </div>
      <!-- Steps 1-10: Agent Outputs -->
      <div class="step-content" id="step1"></div>
      <div class="step-content" id="step2"></div>
      <div class="step-content" id="step3"></div>
      <div class="step-content" id="step4"></div>
      <div class="step-content" id="step5"></div>
      <div class="step-content" id="step6"></div>
      <div class="step-content" id="step7"></div>
      <div class="step-content" id="step8"></div>
      <div class="step-content" id="step9"></div>
      <div class="step-content" id="step10"></div>
    </main>
  </div>
</div>

<!-- 版块二：课程生成 -->
<div class="tab-content" id="tab-generate">
  <div class="card" style="max-width:900px;margin:20px auto;">
    <h2>📝 课程生成</h2>
    <p class="card-desc">选择园本课程方案，生成具体的教学计划和资源包</p>
    <div id="generateContent"><p style="text-align:center;padding:40px;color:#999;">请先从「我的园本课程」中选择一个方案，或园长先生成方案</p></div>
  </div>
</div>

<!-- 版块三：我的园本课程 -->
<div class="tab-content" id="tab-my-courses">
  <div class="my-courses-layout" id="myCoursesLayout">
    <div class="mc-sidebar" id="mcSidebar">
      <div class="mc-sidebar-header">
        <input type="text" class="mc-search" placeholder="🔍 搜索方案..." id="mcSearch" oninput="filterPlans()">
      </div>
      <div class="mc-plan-list" id="mcPlanList">
        <p style="text-align:center;padding:40px;color:#999;">暂无方案</p>
      </div>
    </div>
    <div class="mc-detail" id="mcDetail">
      <div class="mc-empty-state">
        <div style="font-size:48px;">📂</div>
        <p>选择一个方案查看详情</p>
      </div>
    </div>
  </div>
</div>

<script src="main.js"></script>
<script>
(function() {
  var user = requireAuth();
  if (!user) return;
  document.getElementById('navUserName').textContent = user.name + '（' + user.kinderName + '）';
  if (user.role === 'principal') {
    document.getElementById('menuAccountManage').style.display = 'block';
    document.getElementById('navTabs').querySelector('[data-tab="construction"]').style.display = '';
  } else {
    document.getElementById('navTabs').querySelector('[data-tab="construction"]').style.display = 'none';
  }
  switchTab(user.role === 'principal' ? 'construction' : 'generate');
})();
</script>
</body>
</html>
```

---

### Task 5: 版块一改造 — 报告汇总页增加「生成方案」按钮

**Files:**
- Modify: `d:\webProject\yuanbenkecheng\main.js` — `buildReport()` 函数（约第1644行）

- [ ] **Step 1: 修改 buildReport()，移除课程方案 Tab，增加生成按钮**

将 `buildReport()` 函数替换为：

```js
function buildReport() {
  const data = state.formData;
  const stepEl = document.getElementById('step10');
  const featureWord = getFeatureWord(data);
  const resourceWord = getResourceWord(data);
  const goalWord = getGoalWord(data);

  stepEl.innerHTML = `
    <div class="card">
      <div class="report-summary-header">
        <h2>📄 ${data.name} · 园本课程建设成果</h2>
        <p class="card-desc">AI驻园专家平台 · 九步生成完整课程体系</p>
        <div class="report-summary-stats">
          <div class="report-stat-item"><div class="stat-value">${data.classCount || '-'}</div><div class="stat-label">班级数量</div></div>
          <div class="report-stat-item"><div class="stat-value">${data.studentCount || '-'}</div><div class="stat-label">幼儿人数</div></div>
          <div class="report-stat-item"><div class="stat-value">${featureWord}</div><div class="stat-label">核心特色</div></div>
          <div class="report-stat-item"><div class="stat-value">${resourceWord}</div><div class="stat-label">地域资源</div></div>
          <div class="report-stat-item"><div class="stat-value">${goalWord}</div><div class="stat-label">培养目标</div></div>
        </div>
      </div>
      ${buildSummaryContent(data)}
      <div class="report-actions" style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-top:24px;">
        <button class="btn btn-accent" onclick="generateAndSavePlan()" style="font-size:16px;padding:14px 32px;">📖 生成园本课程方案</button>
        <button class="btn btn-outline" onclick="window.print()">🖨️ 打印报告</button>
        <button class="btn btn-outline" onclick="copyReport()">📋 复制全文</button>
        <button class="btn btn-outline" onclick="resetApp()">🔄 重新开始</button>
      </div>
    </div>
  `;
}
```

- [ ] **Step 2: 在 main.js 中添加 generateAndSavePlan() 函数**

```js
async function generateAndSavePlan() {
  const data = state.formData;
  const user = getCurrentUser();
  if (!user) { alert('请先登录'); return; }
  const fw = getFeatureWord(data);
  const rw = getResourceWord(data);
  const gw = getGoalWord(data);
  const htmlContent = buildCurriculumDoc(data);
  try {
    await dbAdd('curriculum_plans', {
      kinderId: user.kinderId, name: data.name, fw, rw, gw,
      formData: JSON.parse(JSON.stringify(data)),
      htmlContent: htmlContent,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    alert('园本课程方案已生成并保存到「我的园本课程」！');
    if (typeof switchTab === 'function') {
      switchTab('my-courses');
    }
  } catch (e) {
    alert('保存失败：' + e.message);
  }
}
```

- [ ] **Step 3: 删除不再需要的 switchReportTab 函数**

删除 `switchReportTab` 函数（约第1709行）。

---

### Task 6: 版块三 — 方案列表与详情

**Files:**
- Modify: `d:\webProject\yuanbenkecheng\main.js`

- [ ] **Step 1: 添加 refreshPlanList() 和 renderPlanList() 函数**

```js
// ========== 我的园本课程 — 方案列表 ==========
let currentPlans = [];
let selectedPlanId = null;

async function refreshPlanList() {
  const user = getCurrentUser();
  if (!user) return;
  const plans = await dbGetByIndex('curriculum_plans', 'kinderId', user.kinderId);
  currentPlans = plans.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  renderPlanList();
}

function renderPlanList(filterText) {
  const listEl = document.getElementById('mcPlanList');
  if (!listEl) return;
  let plans = currentPlans;
  if (filterText) {
    const kw = filterText.toLowerCase();
    plans = plans.filter(p => p.name.toLowerCase().includes(kw) || (p.fw || '').toLowerCase().includes(kw));
  }
  if (plans.length === 0) {
    listEl.innerHTML = '<p style="text-align:center;padding:40px;color:#999;">暂无方案</p>';
    return;
  }
  listEl.innerHTML = plans.map(p => `
    <div class="mc-plan-item ${selectedPlanId === p.id ? 'active' : ''}" onclick="selectPlan(${p.id})">
      <div class="mc-plan-name">📋 ${p.name}</div>
      <div class="mc-plan-meta">
        <span class="mc-plan-tag">${p.fw || ''}</span>
        <span class="mc-plan-date">${new Date(p.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  `).join('');
}

function filterPlans() {
  const kw = document.getElementById('mcSearch') ? document.getElementById('mcSearch').value : '';
  renderPlanList(kw);
}
```

- [ ] **Step 2: 添加 selectPlan() 详情展示函数**

```js
async function selectPlan(id) {
  selectedPlanId = id;
  renderPlanList();
  const plan = await dbGet('curriculum_plans', id);
  if (!plan) return;
  const detailEl = document.getElementById('mcDetail');
  const contents = await dbGetByIndex('course_contents', 'planId', id);
  const records = await dbGetByIndex('implementation_records', 'planId', id);

  detailEl.innerHTML = `
    <div class="mc-detail-header">
      <h3>📋 ${plan.name}</h3>
      <div class="mc-detail-actions">
        <button class="btn btn-sm" onclick="editPlan(${plan.id})">✏️ 编辑</button>
        <button class="btn btn-sm btn-accent" onclick="downloadPlanPDF(${plan.id})">📥 下载PDF</button>
        <button class="btn btn-sm btn-outline" onclick="printPlan(${plan.id})">🖨️ 打印</button>
        <button class="btn btn-sm btn-danger" onclick="deletePlan(${plan.id})">🗑️ 删除</button>
      </div>
    </div>
    <div class="mc-detail-body">
      <div class="mc-detail-section">
        <h4>📖 方案预览</h4>
        <div class="mc-plan-preview">${plan.htmlContent}</div>
      </div>
      <div class="mc-detail-section">
        <h4>📝 关联课程内容 (${contents.length})</h4>
        <div class="mc-contents-list">
          ${contents.length === 0 ? '<p style="color:#999;">暂无课程内容，请前往「课程生成」创建</p>' :
            contents.map(c => `
              <div class="mc-content-item">
                <span class="mc-content-type">${c.type === 'weekly_plan' ? '📅 周计划' : '📦 资源包'}</span>
                <span>${c.theme} · ${c.ageGroup}</span>
                <span class="mc-content-date">${new Date(c.createdAt).toLocaleDateString()}</span>
                <button class="btn btn-sm btn-outline" onclick="viewContent(${c.id})">查看</button>
                <button class="btn btn-sm btn-danger" onclick="deleteContent(${c.id})">删除</button>
              </div>
            `).join('')
          }
        </div>
      </div>
      <div class="mc-detail-section">
        <h4>📸 实施记录 (${records.length})</h4>
        <div class="mc-records-toolbar">
          <select id="recordTypeFilter" onchange="filterRecords(${plan.id})">
            <option value="all">全部类型</option>
            <option value="artwork">🎨 幼儿作品</option>
            <option value="observation">🔍 观察记录</option>
            <option value="reflection">📝 教学反思</option>
            <option value="photo">📷 照片</option>
            <option value="video">🎬 视频</option>
          </select>
          <button class="btn btn-sm btn-accent" onclick="showUploadRecord(${plan.id})">+ 上传记录</button>
        </div>
        <div class="mc-records-grid" id="mcRecordsGrid">${renderRecords(records)}</div>
      </div>
    </div>
  `;
}

function renderRecords(records, filterType) {
  let filtered = records;
  if (filterType && filterType !== 'all') {
    filtered = records.filter(r => r.type === filterType);
  }
  if (filtered.length === 0) return '<p style="color:#999;text-align:center;padding:20px;">暂无记录</p>';
  return filtered.map(r => `
    <div class="mc-record-card">
      <div class="mc-record-type">${getRecordIcon(r.type)} ${getRecordTypeName(r.type)}</div>
      ${r.fileData ? `<img src="${r.fileData}" class="mc-record-thumb" onclick="previewRecord(${r.id})">` : ''}
      <div class="mc-record-title">${r.title || '未命名'}</div>
      <div class="mc-record-meta"><span>${r.createdBy || ''}</span><span>${new Date(r.createdAt).toLocaleDateString()}</span></div>
      <button class="btn btn-sm btn-danger" onclick="deleteRecord(${r.id})">删除</button>
    </div>
  `).join('');
}

function getRecordIcon(type) {
  const map = { artwork: '🎨', observation: '🔍', reflection: '📝', photo: '📷', video: '🎬' };
  return map[type] || '📄';
}

function getRecordTypeName(type) {
  const map = { artwork: '幼儿作品', observation: '观察记录', reflection: '教学反思', photo: '照片', video: '视频' };
  return map[type] || type;
}

function filterRecords(planId) {
  const filterType = document.getElementById('recordTypeFilter').value;
  dbGetByIndex('implementation_records', 'planId', planId).then(records => {
    document.getElementById('mcRecordsGrid').innerHTML = renderRecords(records, filterType);
  });
}
```

- [ ] **Step 3: 添加方案操作函数（编辑、下载、删除）**

```js
async function editPlan(id) {
  const plan = await dbGet('curriculum_plans', id);
  if (!plan) return;
  const newHtml = prompt('编辑方案HTML内容（可直接修改文字）：', plan.htmlContent);
  if (newHtml !== null) {
    plan.htmlContent = newHtml;
    plan.updatedAt = new Date().toISOString();
    await dbPut('curriculum_plans', plan);
    selectPlan(id);
  }
}

function downloadPlanPDF(id) {
  dbGet('curriculum_plans', id).then(plan => {
    if (!plan) return;
    const w = window.open('', '_blank');
    w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${plan.name}</title><link rel="stylesheet" href="styles.css"></head><body><div class="doc-wrapper" style="max-width:1000px;margin:0 auto;padding:40px;">${plan.htmlContent}</div></body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 500);
  });
}

function printPlan(id) { downloadPlanPDF(id); }

async function deletePlan(id) {
  if (!confirm('确定删除该方案？关联的课程内容和实施记录也将被删除。')) return;
  const contents = await dbGetByIndex('course_contents', 'planId', id);
  for (const c of contents) await dbDelete('course_contents', c.id);
  const records = await dbGetByIndex('implementation_records', 'planId', id);
  for (const r of records) await dbDelete('implementation_records', r.id);
  await dbDelete('curriculum_plans', id);
  selectedPlanId = null;
  document.getElementById('mcDetail').innerHTML = '<div class="mc-empty-state"><div style="font-size:48px;">📂</div><p>选择一个方案查看详情</p></div>';
  refreshPlanList();
}

async function viewContent(id) {
  const c = await dbGet('course_contents', id);
  if (!c) return;
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };
  overlay.innerHTML = `<div class="modal-card" style="max-width:700px;"><h3>${c.type === 'weekly_plan' ? '📅 周教学计划' : '📦 主题资源包'}</h3><div style="max-height:60vh;overflow-y:auto;">${c.htmlContent}</div><div class="modal-actions"><button class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">关闭</button></div></div>`;
  document.body.appendChild(overlay);
}

async function deleteContent(id) {
  if (!confirm('确定删除该课程内容？')) return;
  await dbDelete('course_contents', id);
  if (selectedPlanId) selectPlan(selectedPlanId);
}
```

---

### Task 7: 版块二 — 课程生成

**Files:**
- Modify: `d:\webProject\yuanbenkecheng\main.js`

- [ ] **Step 1: 添加课程生成入口函数 showGenerateUI()**

```js
// ========== 课程生成 ==========
async function showGenerateUI() {
  const user = getCurrentUser();
  if (!user) return;
  const plans = await dbGetByIndex('curriculum_plans', 'kinderId', user.kinderId);
  const container = document.getElementById('generateContent');
  if (!container) return;

  if (plans.length === 0) {
    container.innerHTML = '<p style="text-align:center;padding:40px;color:#999;">暂无园本课程方案，请园长先生成方案后再来</p>';
    return;
  }

  const planOptions = plans.map(p => `<option value="${p.id}">${p.name}（${p.fw}）</option>`).join('');
  container.innerHTML = `
    <div class="generate-form">
      <div class="form-group"><label>选择课程方案</label><select id="genPlanId">${planOptions}</select></div>
      <div class="form-group"><label>年龄段</label><select id="genAgeGroup"><option value="小班">小班（3-4岁）</option><option value="中班">中班（4-5岁）</option><option value="大班">大班（5-6岁）</option></select></div>
      <div class="form-group"><label>主题</label><input type="text" id="genTheme" placeholder="如：我身边的运动"></div>
      <div class="form-group"><label>生成类型</label><select id="genType" onchange="toggleGenOptions()"><option value="weekly_plan">📅 周教学计划</option><option value="resource_pack">📦 主题资源包</option></select></div>
      <div id="genWeekOption" class="form-group"><label>第几周</label><input type="number" id="genWeek" value="1" min="1" max="20"></div>
      <button class="btn btn-primary" onclick="doGenerate()" style="width:100%;margin-top:12px;">✨ 生成课程内容</button>
    </div>
    <div id="genResult"></div>
  `;
}

function toggleGenOptions() {
  const type = document.getElementById('genType').value;
  document.getElementById('genWeekOption').style.display = type === 'weekly_plan' ? 'block' : 'none';
}
```

- [ ] **Step 2: 添加课程生成逻辑 doGenerate() 和模板函数**

```js
async function doGenerate() {
  const planId = parseInt(document.getElementById('genPlanId').value);
  const ageGroup = document.getElementById('genAgeGroup').value;
  const theme = document.getElementById('genTheme').value.trim();
  const type = document.getElementById('genType').value;
  const week = document.getElementById('genWeek') ? document.getElementById('genWeek').value : 1;
  const user = getCurrentUser();
  if (!theme) { alert('请输入主题名称'); return; }
  const plan = await dbGet('curriculum_plans', planId);
  if (!plan) { alert('方案不存在'); return; }

  let content;
  if (type === 'weekly_plan') {
    content = generateWeeklyPlan(plan, ageGroup, theme, week);
  } else {
    content = generateResourcePack(plan, ageGroup, theme);
  }

  const resultEl = document.getElementById('genResult');
  resultEl.innerHTML = `
    <div class="gen-result-card">
      <h4>${type === 'weekly_plan' ? '📅 周教学计划' : '📦 主题资源包'}</h4>
      <p>${plan.name} · ${theme} · ${ageGroup}</p>
      <div class="gen-content-preview">${content.html}</div>
      <div class="gen-actions">
        <button class="btn btn-accent" onclick="saveGeneratedContent(${planId}, '${theme.replace(/'/g, "\\'")}', '${ageGroup}', '${type}', ${week})">💾 保存到我的园本课程</button>
        <button class="btn btn-outline" onclick="doGenerate()">🔄 重新生成</button>
      </div>
    </div>
  `;
}

function generateWeeklyPlan(plan, ageGroup, theme, week) {
  const fw = plan.fw || '特色';
  const rw = plan.rw || '资源';
  const days = ['周一', '周二', '周三', '周四', '周五'];
  const dayActivities = {
    '小班': ['感官体验', '模仿游戏', '简单操作', '故事分享', '亲子互动'],
    '中班': ['观察发现', '合作游戏', '动手操作', '表达交流', '实地探访'],
    '大班': ['问题探究', '项目协作', '创意制作', '成果展示', '社区实践']
  };
  const activities = dayActivities[ageGroup] || dayActivities['中班'];

  const rows = days.map((day, i) => `
    <tr>
      <td><strong>${day}</strong></td>
      <td>${fw}${activities[i]}</td>
      <td><strong>认知：</strong>了解${fw}相关的基本知识<br><strong>技能：</strong>发展${fw}相关的操作/表达能力<br><strong>情感：</strong>激发对${fw}活动的兴趣和喜爱</td>
      <td>${rw}相关材料、${fw}主题教具、记录工具</td>
      <td><strong>导入：</strong>以${fw}相关的故事/情境引发兴趣（5分钟）<br><strong>展开：</strong>${ageGroup}幼儿${fw}${activities[i]}活动（15-20分钟）<br><strong>结束：</strong>分享交流，教师小结（5分钟）</td>
      <td>家庭${fw}亲子任务、延伸区域活动建议</td>
    </tr>
  `).join('');

  const html = `
    <h5>${theme} · 第${week}周教学计划（${ageGroup}）</h5>
    <table class="doc-table"><thead><tr><th>日期</th><th>活动名称</th><th>活动目标</th><th>材料准备</th><th>活动流程</th><th>延伸建议</th></tr></thead><tbody>${rows}</tbody></table>
    <div style="margin-top:16px;padding:12px;background:#f8fafb;border-radius:8px;">
      <strong>📌 本周观察要点：</strong>
      <ul><li>幼儿对${fw}活动的参与度和兴趣表现</li><li>幼儿在${fw}活动中的动作发展/语言表达/社会交往情况</li><li>需要个别支持的幼儿及支持策略</li></ul>
    </div>
  `;
  return { html, data: { planId: plan.id, theme, ageGroup, week, days: days.map((d, i) => ({ day: d, activity: activities[i] })) } };
}

function generateResourcePack(plan, ageGroup, theme) {
  const fw = plan.fw || '特色';
  const rw = plan.rw || '资源';
  const books = [
    { name: `《${fw}真有趣》`, reason: `以生动有趣的画面引导幼儿认识${fw}，适合${ageGroup}幼儿阅读` },
    { name: `《我爱${fw}》`, reason: `从幼儿视角讲述${fw}的故事，激发幼儿对${fw}的情感认同` },
    { name: `《小脚丫去${fw}》`, reason: `通过主人公的${fw}冒险，培养幼儿勇敢尝试的品质` },
    { name: `《${fw}的秘密》`, reason: `科普类绘本，满足${ageGroup}幼儿对${fw}的好奇心和探究欲` }
  ];
  const games = [
    { name: `${fw}大闯关`, desc: `设置${fw}主题的障碍赛道，幼儿通过跑、跳、爬等动作完成挑战`, materials: `${rw}相关道具、标志物` },
    { name: `${fw}模仿秀`, desc: `教师展示${fw}相关动作/造型，幼儿模仿并创造自己的版本`, materials: `图片卡片、音乐` },
    { name: `${fw}寻宝`, desc: `在活动区域隐藏${fw}相关物品，幼儿根据线索寻找`, materials: `${fw}相关小物品、线索卡` },
    { name: `${fw}创意坊`, desc: `提供多种材料，幼儿自由创作${fw}主题作品`, materials: `低结构材料、画笔、胶水等` }
  ];

  const html = `
    <h5>${theme} · 主题资源包（${ageGroup}）</h5>
    <h6>📚 绘本推荐</h6>
    <div class="resource-cards">${books.map(b => `<div class="resource-card"><div class="rc-title">${b.name}</div><div class="rc-desc">${b.reason}</div></div>`).join('')}</div>
    <h6>🎮 游戏方案</h6>
    <div class="resource-cards">${games.map(g => `<div class="resource-card"><div class="rc-title">${g.name}</div><div class="rc-desc">${g.desc}</div><div class="rc-materials"><strong>材料：</strong>${g.materials}</div></div>`).join('')}</div>
    <h6>🏠 环境创设建议</h6>
    <ul><li><strong>主题墙：</strong>围绕"${theme}"布置${fw}主题互动墙，随活动推进动态更新</li><li><strong>区域材料：</strong>在美工区投放${rw}相关自然材料，在建构区投放${fw}场景搭建材料</li><li><strong>作品展示：</strong>设置"${fw}小达人"作品展示区，展示幼儿的${fw}创作成果</li></ul>
    <h6>👨‍👩‍👧 家园共育任务</h6>
    <ul><li><strong>周末亲子${fw}：</strong>请家长带幼儿到${rw}进行${fw}体验，拍照记录并分享</li><li><strong>家庭${fw}角：</strong>建议家长在家中设置小型${fw}活动区，延续幼儿园的${fw}活动</li><li><strong>${fw}故事分享：</strong>请家长和幼儿一起创编${fw}小故事，带到幼儿园分享</li></ul>
  `;
  return { html, data: { planId: plan.id, theme, ageGroup, books, games } };
}

async function saveGeneratedContent(planId, theme, ageGroup, type, week) {
  const user = getCurrentUser();
  if (!user) return;
  const plan = await dbGet('curriculum_plans', planId);
  if (!plan) return;
  let content;
  if (type === 'weekly_plan') { content = generateWeeklyPlan(plan, ageGroup, theme, week); }
  else { content = generateResourcePack(plan, ageGroup, theme); }
  await dbAdd('course_contents', {
    planId, kinderId: user.kinderId, theme, ageGroup, type,
    content: content.data, htmlContent: content.html,
    createdBy: user.name, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  });
  alert('课程内容已保存到「我的园本课程」！');
}
```

- [ ] **Step 3: 在 switchTab 中集成课程生成入口**

修改 `switchTab` 函数，当切换到 `generate` 时调用 `showGenerateUI()`：

```js
function switchTab(tab) {
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  const tabBtn = document.querySelector(`.nav-tab[data-tab="${tab}"]`);
  if (tabBtn) tabBtn.classList.add('active');
  const tabContent = document.getElementById('tab-' + tab);
  if (tabContent) tabContent.classList.add('active');
  if (tab === 'my-courses') refreshPlanList();
  if (tab === 'generate') showGenerateUI();
}
```

---

### Task 8: 版块三 — 实施记录上传

**Files:**
- Modify: `d:\webProject\yuanbenkecheng\main.js`

- [ ] **Step 1: 添加上传记录弹窗和相关函数**

```js
// ========== 实施记录上传 ==========
function showUploadRecord(planId) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'uploadModal';
  overlay.innerHTML = `
    <div class="modal-card">
      <h3>📸 上传实施记录</h3>
      <div class="form-group"><label>记录类型</label><select id="uploadType" onchange="toggleUploadFields()"><option value="artwork">🎨 幼儿作品</option><option value="observation">🔍 观察记录</option><option value="reflection">📝 教学反思</option><option value="photo">📷 照片</option><option value="video">🎬 视频</option></select></div>
      <div class="form-group"><label>标题</label><input type="text" id="uploadTitle" placeholder="请输入记录标题"></div>
      <div class="form-group" id="uploadFileGroup"><label>上传文件</label><input type="file" id="uploadFile" accept="image/*,video/*" onchange="previewUploadFile()"><div id="uploadPreview" style="margin-top:8px;"></div></div>
      <div class="form-group" id="uploadDescGroup"><label>描述</label><textarea id="uploadDesc" rows="3" placeholder="请输入描述内容"></textarea></div>
      <div id="observationFields" style="display:none;">
        <div class="form-group"><label>观察对象</label><input type="text" id="obsTarget" placeholder="如：小明"></div>
        <div class="form-group"><label>观察场景</label><input type="text" id="obsScene" placeholder="如：户外运动区"></div>
        <div class="form-group"><label>行为描述</label><textarea id="obsBehavior" rows="3" placeholder="描述观察到的具体行为"></textarea></div>
        <div class="form-group"><label>分析与回应</label><textarea id="obsAnalysis" rows="3" placeholder="对行为的分析和教师的回应策略"></textarea></div>
      </div>
      <div class="modal-actions"><button class="btn btn-accent" onclick="doUploadRecord(${planId})">上传</button><button class="btn btn-outline" onclick="closeUploadModal()">取消</button></div>
    </div>
  `;
  document.body.appendChild(overlay);
}

function toggleUploadFields() {
  const type = document.getElementById('uploadType').value;
  document.getElementById('uploadFileGroup').style.display = type === 'observation' ? 'none' : 'block';
  document.getElementById('uploadDescGroup').style.display = type === 'observation' ? 'none' : 'block';
  document.getElementById('observationFields').style.display = type === 'observation' ? 'block' : 'none';
}

function previewUploadFile() {
  const file = document.getElementById('uploadFile').files[0];
  const preview = document.getElementById('uploadPreview');
  if (!file) { preview.innerHTML = ''; return; }
  const reader = new FileReader();
  reader.onload = (e) => {
    if (file.type.startsWith('image/')) { preview.innerHTML = `<img src="${e.target.result}" style="max-width:200px;max-height:150px;border-radius:8px;">`; }
    else if (file.type.startsWith('video/')) { preview.innerHTML = `<video src="${e.target.result}" controls style="max-width:200px;max-height:150px;"></video>`; }
  };
  reader.readAsDataURL(file);
}

function closeUploadModal() { const modal = document.getElementById('uploadModal'); if (modal) modal.remove(); }

async function doUploadRecord(planId) {
  const user = getCurrentUser();
  if (!user) return;
  const type = document.getElementById('uploadType').value;
  const title = document.getElementById('uploadTitle').value.trim();
  if (!title) { alert('请输入标题'); return; }
  let description = '', fileData = '', fileType = '';
  if (type === 'observation') {
    description = JSON.stringify({ target: document.getElementById('obsTarget').value, scene: document.getElementById('obsScene').value, behavior: document.getElementById('obsBehavior').value, analysis: document.getElementById('obsAnalysis').value });
  } else if (type === 'reflection') {
    description = document.getElementById('uploadDesc').value;
  } else {
    description = document.getElementById('uploadDesc').value;
    const fileInput = document.getElementById('uploadFile');
    if (fileInput.files.length > 0) {
      const file = fileInput.files[0];
      fileType = file.type;
      fileData = await new Promise((resolve) => { const reader = new FileReader(); reader.onload = (e) => resolve(e.target.result); reader.readAsDataURL(file); });
    }
  }
  const plan = await dbGet('curriculum_plans', planId);
  await dbAdd('implementation_records', {
    planId, theme: plan ? (plan.fw || '') : '', kinderId: user.kinderId,
    type, title, description, fileData, fileType,
    createdBy: user.name, createdAt: new Date().toISOString()
  });
  closeUploadModal();
  selectPlan(planId);
}

async function deleteRecord(id) {
  if (!confirm('确定删除该记录？')) return;
  await dbDelete('implementation_records', id);
  if (selectedPlanId) selectPlan(selectedPlanId);
}

function previewRecord(id) {
  dbGet('implementation_records', id).then(r => {
    if (!r || !r.fileData) return;
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };
    if (r.fileType.startsWith('image/')) { overlay.innerHTML = `<img src="${r.fileData}" style="max-width:90vw;max-height:90vh;border-radius:8px;">`; }
    else if (r.fileType.startsWith('video/')) { overlay.innerHTML = `<video src="${r.fileData}" controls style="max-width:90vw;max-height:90vh;"></video>`; }
    document.body.appendChild(overlay);
  });
}
```

---

### Task 9: 账号管理（园长创建教师）

**Files:**
- Modify: `d:\webProject\yuanbenkecheng\main.js`

- [ ] **Step 1: 添加账号管理弹窗**

```js
// ========== 账号管理 ==========
async function showAccountManage() {
  const user = getCurrentUser();
  if (!user || user.role !== 'principal') return;
  const teachers = await getTeachers(user.kinderId);
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'accountModal';
  overlay.innerHTML = `
    <div class="modal-card" style="max-width:500px;">
      <h3>👥 教师账号管理</h3>
      <div class="account-list">
        ${teachers.length === 0 ? '<p style="color:#999;">暂无教师账号</p>' :
          teachers.map(t => `<div class="account-item"><span>👤 ${t.name}</span><span style="color:#999;">${t.phone}</span><button class="btn btn-sm btn-danger" onclick="deleteTeacher(${t.id})">删除</button></div>`).join('')
        }
      </div>
      <hr>
      <h4>+ 添加教师</h4>
      <div class="form-group"><label>姓名</label><input type="text" id="newTeacherName" placeholder="教师姓名"></div>
      <div class="form-group"><label>手机号</label><input type="text" id="newTeacherPhone" placeholder="教师手机号"></div>
      <div class="form-group"><label>初始密码</label><input type="text" id="newTeacherPwd" placeholder="设置初始密码"></div>
      <div class="modal-actions"><button class="btn btn-accent" onclick="doAddTeacher()">添加</button><button class="btn btn-outline" onclick="document.getElementById('accountModal').remove()">关闭</button></div>
    </div>
  `;
  document.body.appendChild(overlay);
}

async function doAddTeacher() {
  const user = getCurrentUser();
  const name = document.getElementById('newTeacherName').value.trim();
  const phone = document.getElementById('newTeacherPhone').value.trim();
  const pwd = document.getElementById('newTeacherPwd').value.trim();
  if (!name || !phone || !pwd) { alert('请填写所有字段'); return; }
  try {
    await createTeacher(name, phone, pwd, user.kinderId);
    alert('教师账号创建成功！');
    document.getElementById('accountModal').remove();
    showAccountManage();
  } catch (e) { alert('创建失败：' + e.message); }
}

async function deleteTeacher(id) {
  if (!confirm('确定删除该教师账号？')) return;
  await dbDelete('accounts', id);
  document.getElementById('accountModal').remove();
  showAccountManage();
}
```

---

### Task 10: 新增 CSS 样式

**Files:**
- Modify: `d:\webProject\yuanbenkecheng\styles.css`

- [ ] **Step 1: 在 styles.css 末尾追加所有新样式**

```css
/* ========== Auth Pages ========== */
.auth-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.auth-card { background: #fff; border-radius: 16px; padding: 40px; width: 400px; max-width: 90vw; box-shadow: 0 8px 40px rgba(0,0,0,0.1); }
.auth-card h2 { margin: 0 0 24px; text-align: center; color: #2e7d32; }
.auth-card .form-group { margin-bottom: 16px; }
.auth-card .form-group label { display: block; margin-bottom: 6px; font-weight: 600; font-size: 14px; }
.auth-card .form-group input { width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; box-sizing: border-box; }
.auth-switch { text-align: center; margin-top: 16px; font-size: 13px; color: #666; }
.auth-switch a { color: #2e7d32; font-weight: 600; text-decoration: none; }

/* ========== Top Navigation ========== */
.top-nav { display: flex; align-items: center; background: #fff; border-bottom: 1px solid #e0e0e0; padding: 0 24px; height: 56px; position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.nav-brand { font-size: 16px; font-weight: 700; color: #2e7d32; white-space: nowrap; }
.nav-tabs { display: flex; gap: 4px; margin: 0 24px; flex: 1; }
.nav-tab { padding: 8px 16px; border: none; background: none; font-size: 14px; cursor: pointer; border-radius: 8px; color: #666; transition: all 0.2s; }
.nav-tab:hover { background: #f0f0f0; }
.nav-tab.active { background: #e8f5e9; color: #2e7d32; font-weight: 600; }
.nav-user { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #333; }
.nav-user-btn { background: none; border: none; cursor: pointer; font-size: 12px; color: #999; }
.nav-dropdown { position: relative; }
.nav-dropdown-content { position: absolute; right: 0; top: 100%; background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.1); min-width: 140px; z-index: 200; }
.nav-dropdown-content a { display: block; padding: 10px 16px; font-size: 13px; color: #333; text-decoration: none; }
.nav-dropdown-content a:hover { background: #f5f5f5; }

/* ========== Tab Content ========== */
.tab-content { display: none; min-height: calc(100vh - 56px); }
.tab-content.active { display: block; }

/* ========== My Courses Layout ========== */
.my-courses-layout { display: flex; height: calc(100vh - 56px); }
.mc-sidebar { width: 280px; min-width: 280px; border-right: 1px solid #e0e0e0; background: #fafafa; display: flex; flex-direction: column; overflow: hidden; }
.mc-sidebar-header { padding: 16px; }
.mc-search { width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 13px; box-sizing: border-box; }
.mc-plan-list { flex: 1; overflow-y: auto; padding: 0 8px 8px; }
.mc-plan-item { padding: 12px; margin-bottom: 4px; border-radius: 8px; cursor: pointer; transition: background 0.15s; }
.mc-plan-item:hover { background: #e8f5e9; }
.mc-plan-item.active { background: #c8e6c9; }
.mc-plan-name { font-weight: 600; font-size: 14px; margin-bottom: 4px; }
.mc-plan-meta { display: flex; gap: 8px; align-items: center; }
.mc-plan-tag { font-size: 11px; background: #e8f5e9; color: #2e7d32; padding: 2px 8px; border-radius: 4px; }
.mc-plan-date { font-size: 11px; color: #999; }
.mc-detail { flex: 1; overflow-y: auto; padding: 24px; }
.mc-empty-state { text-align: center; padding: 80px 20px; color: #999; }
.mc-detail-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
.mc-detail-header h3 { margin: 0; font-size: 20px; }
.mc-detail-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.mc-detail-section { margin-bottom: 24px; }
.mc-detail-section h4 { font-size: 15px; margin: 0 0 12px; padding-bottom: 8px; border-bottom: 1px solid #eee; }
.mc-plan-preview { max-height: 500px; overflow-y: auto; border: 1px solid #eee; border-radius: 8px; padding: 16px; background: #fafafa; }
.mc-contents-list { display: flex; flex-direction: column; gap: 8px; }
.mc-content-item { display: flex; align-items: center; gap: 12px; padding: 10px 12px; background: #f8fafb; border-radius: 8px; font-size: 13px; }
.mc-content-type { font-weight: 600; color: #2e7d32; }
.mc-content-date { color: #999; margin-left: auto; }
.mc-records-toolbar { display: flex; gap: 8px; align-items: center; margin-bottom: 12px; }
.mc-records-toolbar select { padding: 6px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; }
.mc-records-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; }
.mc-record-card { background: #fff; border: 1px solid #eee; border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 6px; }
.mc-record-type { font-size: 12px; font-weight: 600; color: #666; }
.mc-record-thumb { width: 100%; height: 120px; object-fit: cover; border-radius: 6px; cursor: pointer; }
.mc-record-title { font-size: 13px; font-weight: 600; }
.mc-record-meta { font-size: 11px; color: #999; display: flex; justify-content: space-between; }

/* ========== Generate Form ========== */
.generate-form { max-width: 500px; margin: 0 auto; }
.generate-form .form-group { margin-bottom: 16px; }
.generate-form .form-group label { display: block; margin-bottom: 6px; font-weight: 600; font-size: 14px; }
.generate-form .form-group input, .generate-form .form-group select { width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; box-sizing: border-box; }
.gen-result-card { margin-top: 24px; background: #f8fafb; border-radius: 12px; padding: 20px; }
.gen-content-preview { margin: 16px 0; max-height: 500px; overflow-y: auto; }
.gen-actions { display: flex; gap: 8px; }

/* ========== Resource Cards ========== */
.resource-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; margin-bottom: 16px; }
.resource-card { background: #fff; border: 1px solid #eee; border-radius: 8px; padding: 14px; }
.rc-title { font-weight: 600; font-size: 14px; margin-bottom: 6px; color: #2e7d32; }
.rc-desc { font-size: 13px; color: #555; line-height: 1.6; }
.rc-materials { font-size: 12px; color: #888; margin-top: 6px; }

/* ========== Modal ========== */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-card { background: #fff; border-radius: 12px; padding: 28px; width: 480px; max-width: 90vw; max-height: 80vh; overflow-y: auto; box-shadow: 0 8px 40px rgba(0,0,0,0.15); }
.modal-card h3 { margin: 0 0 20px; }
.modal-card .form-group { margin-bottom: 14px; }
.modal-card .form-group label { display: block; margin-bottom: 6px; font-weight: 600; font-size: 13px; }
.modal-card .form-group input, .modal-card .form-group select, .modal-card .form-group textarea { width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; box-sizing: border-box; }
.modal-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 20px; }

/* ========== Account List ========== */
.account-list { margin-bottom: 16px; }
.account-item { display: flex; align-items: center; gap: 12px; padding: 10px 12px; background: #f8fafb; border-radius: 8px; margin-bottom: 6px; font-size: 13px; }
.account-item span:last-child { margin-left: auto; }

/* ========== Buttons ========== */
.btn-sm { padding: 6px 14px; font-size: 12px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; }
.btn-danger { background: #e74c3c; color: #fff; }
.btn-danger:hover { background: #c0392b; }

/* ========== Responsive ========== */
@media (max-width: 768px) {
  .top-nav { padding: 0 12px; flex-wrap: wrap; height: auto; padding-top: 8px; padding-bottom: 8px; }
  .nav-tabs { margin: 8px 0; overflow-x: auto; }
  .my-courses-layout { flex-direction: column; }
  .mc-sidebar { width: 100%; min-width: 100%; max-height: 200px; }
  .mc-detail { padding: 16px; }
  .mc-records-grid { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); }
}
```