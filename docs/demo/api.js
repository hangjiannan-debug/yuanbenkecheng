/**
 * 园本课程建设平台 · API 调用模块
 * 通过 /api/chat 代理调用 DeepSeek API
 *
 * DEMO_MODE = true  → 演示模式：跳过 API 调用，仅使用模板（可部署到 GitHub Pages）
 * DEMO_MODE = false → 完整模式：调用真实 AI 优化内容（需要运行 server.py）
 */
var DEMO_MODE = true;

var AI_CONFIG = {
  endpoint: '/api/chat',
  model: 'deepseek-chat',
  maxTokens: 4096,
  temperature: 0.7
};

/**
 * 调用 AI 生成内容
 */
async function callAI(systemPrompt, userPrompt) {
  // 演示模式：直接返回失败，使用模板版本
  if (DEMO_MODE) {
    return { success: false, content: '', error: 'Demo mode: using template version' };
  }

  var messages = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: userPrompt });

  try {
    var response = await fetch(AI_CONFIG.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: messages,
        max_tokens: AI_CONFIG.maxTokens,
        temperature: AI_CONFIG.temperature
      })
    });

    if (!response.ok) {
      return { success: false, content: '', error: 'Server error: ' + response.status };
    }

    var result = await response.json();
    if (result.success && result.content) {
      return { success: true, content: result.content, error: '' };
    } else {
      return { success: false, content: '', error: result.error || 'Unknown error' };
    }
  } catch (e) {
    return { success: false, content: '', error: 'Network error: ' + e.message };
  }
}

/**
 * 生成园本课程方案的 System Prompt
 */
function buildPlanSystemPrompt(data) {
  return '你是一位资深的幼儿园课程专家，擅长为幼儿园设计专业、科学、可落地的园本课程方案。\n\n请根据以下园所信息，生成一份完整的园本课程方案。方案需包含七大章节，以完整的 HTML 格式输出。\n\n## 园所信息\n- 园所名称：' + data.name + '\n- 所在地：' + data.location + '\n- 办园性质：' + data.type + '\n- 班级数：' + data.classCount + '，幼儿数：' + data.studentCount + '\n- 特色方向：' + data.features + '\n- 地域资源：' + data.resources + '\n- 培养目标：' + data.goals + '\n- 发展规划：' + data.plans + '\n- 园内微环境：' + data.microEnv + '\n- 周边300米资源：' + data.nearby + '\n- 教师风格：' + (data.teacherStyle || '表达型') + '\n- 幼儿特点：' + (data.childStyle || '') + '\n- 家长特点：' + (data.parentStyle || '') + '\n\n## 输出要求\n1. 以完整 HTML 格式输出（从 <!DOCTYPE html> 开始），可直接在浏览器中打开\n2. 包含以下七大章节，每个章节标题使用 <h3 class="doc-section-title"><span class="doc-num">N</span>章节名</h3> 格式：\n   - 一、课程起源（从园所真实情境出发，包含一个具体的教育故事或发现）\n   - 二、课程理念与框架（核心理念、课程主张、课程框架）\n   - 三、课程目标（总目标、领域目标、年龄段目标）\n   - 四、课程内容（课程模块、资源利用、主题规划）\n   - 五、课程实施（环境创设、一日流程、教学策略、家园共育）\n   - 六、课程评价（评价理念、幼儿发展评价表、教师评价表、课程评审表、家园共育评价表）\n   - 七、课程保障（组织、制度、师资、资源保障）\n3. 封面使用 <div class="doc-cover"> 包含园所名称和课程名称\n4. 使用 <table class="doc-table"> 格式输出所有表格\n5. 使用 <div class="module-cards"><div class="module-card"> 格式输出课程模块\n6. 使用 <div class="flow-diagram"><div class="flow-node"> 格式输出年龄段进阶图\n7. 使用 <div class="resource-map"><div class="rm-item"> 格式输出资源地图\n\n## 关键约束\n- 禁止套用通用模板句式，每句话需体现该园所的具体特征\n- 园内微环境、周边资源需在方案中有明确体现\n- 教师风格和幼儿特点需融入教学策略章节\n- 家长特点需融入家园共育章节\n- 方案需要专业、科学、可落地，同时具有可读性';
}

/**
 * 生成教案/资源包的 System Prompt
 */
function buildContentSystemPrompt(plan, type, ageGroup, theme) {
  var typeName = type === 'weekly_plan' ? '周教学计划' : '主题资源包';
  return '你是一位资深的幼儿园教师，擅长为园本课程设计具体的教学计划和资源包。\n\n请根据以下园所课程方案信息，生成一份' + ageGroup + '的"' + theme + '"' + typeName + '。\n\n## 课程方案背景\n- 园所名称：' + plan.name + '\n- 特色方向：' + (plan.fw || '') + '\n- 地域资源：' + (plan.rw || '') + '\n- 培养目标：' + (plan.gw || '') + '\n\n## 输出要求\n' + (type === 'weekly_plan'
    ? '1. 以 HTML 表格格式输出周一到周五的教学计划\n2. 每行包含：日期、活动名称、活动目标（认知/技能/情感）、材料准备、活动流程（导入/展开/结束）、延伸建议\n3. 表格底部添加本周观察要点\n4. 活动名称和内容需体现园所特色，不可套用通用模板'
    : '1. 以 HTML 格式输出主题资源包\n2. 包含：绘本推荐（4本）、游戏方案（4个）、环境创设建议、家园共育建议\n3. 每项内容需体现园所特色和地域资源，不可套用通用模板');
}

/**
 * 显示 AI 状态指示器
 */
function showAIStatus(containerId, status, message, retryFn) {
  var container = document.getElementById(containerId);
  if (!container) return;
  var statusEl = container.querySelector('.ai-status-bar');
  if (!statusEl) {
    statusEl = document.createElement('div');
    statusEl.className = 'ai-status-bar';
    container.insertBefore(statusEl, container.firstChild);
  }
  var colors = { loading: '#e3f2fd', success: '#e8f5e9', error: '#fff3e0' };
  var icons = { loading: '✨', success: '✅', error: '⚠️' };
  statusEl.style.cssText = 'padding:10px 16px;margin-bottom:12px;border-radius:8px;font-size:13px;display:flex;align-items:center;gap:8px;';
  statusEl.style.background = colors[status] || '#f5f5f5';

  var retryBtn = '';
  if (status === 'error' && retryFn) {
    retryBtn = '<button onclick="(' + retryFn.toString() + ')()" style="margin-left:auto;padding:4px 12px;border:1px solid #e65100;background:#fff;border-radius:4px;cursor:pointer;font-size:12px;color:#e65100;">🔄 重试</button>';
  }
  statusEl.innerHTML = icons[status] + ' ' + message + retryBtn;

  if (status === 'success') {
    setTimeout(function() { if (statusEl.parentNode) statusEl.remove(); }, 3000);
  }
}
