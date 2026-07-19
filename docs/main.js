// ========== State ==========
const state = {
  currentStep: 0,
  maxUnlockedStep: 0,
  formData: {},
  agentResults: {},
  isGenerating: false,
  agentConfirmed: {},
  currentAgentIndex: -1,
  collaborationMode: null,
  chatHistory: {}
};

// ========== Helper Functions ==========
function splitInput(val) {
  if (!val || !val.trim()) return [];
  return val.split(/[,，、\s]+/).filter(Boolean);
}

function collectFormData() {
  return {
    name: document.getElementById('f_name').value || '未命名园所',
    location: document.getElementById('f_location').value,
    type: document.getElementById('f_type').value,
    classCount: document.getElementById('f_classCount').value,
    studentCount: document.getElementById('f_studentCount').value,
    features: splitInput(document.getElementById('cf_features').value),
    resources: splitInput(document.getElementById('cf_resources').value),
    goals: splitInput(document.getElementById('cf_goals').value),
    plans: splitInput(document.getElementById('cf_plans').value),
    microEnv: splitInput(document.getElementById('cu_micro_env').value),
    nearbyResources: splitInput(document.getElementById('cu_nearby').value),
    teacher: splitInput(document.getElementById('cu_teacher').value),
    child: splitInput(document.getElementById('cu_child').value),
  };
}

function getFeatureWord(data) {
  const featureMap = {
    '自然教育': '自然', '劳动教育': '劳动', '阅读': '书香', '足球': '阳光',
    '非遗': '文化', '科学教育': '科学', '艺术': '艺术', '体育': '健康'
  };
  const features = data.features || [];
  if (features.length > 0) {
    const mapped = features.map(f => featureMap[f] || f).filter(Boolean);
    if (mapped.length > 0) return mapped[0];
  }
  return '多元';
}

function getResourceWord(data) {
  const resourceMap = {
    '茶园': '茶韵', '农田': '田野', '海洋': '海洋', '森林': '森林',
    '博物馆': '博物', '红色基地': '红色', '河流': '水韵', '山川': '山野'
  };
  const resources = data.resources || [];
  if (resources.length > 0) {
    const mapped = resources.map(r => resourceMap[r] || r).filter(Boolean);
    if (mapped.length > 0) return mapped[0];
  }
  return '生活';
}

function getGoalWord(data) {
  const goalMap = {
    '健康儿童': '健康', '自主儿童': '自立', '探究儿童': '探索',
    '创造儿童': '创造', '友善儿童': '友善', '自信儿童': '自信'
  };
  const goals = data.goals || [];
  if (goals.length > 0) {
    const mapped = goals.map(g => goalMap[g] || g).filter(Boolean);
    if (mapped.length > 0) return mapped[0];
  }
  return '成长';
}

// ========== Agent Config ==========
const agents = [
  // ===== Agent 1: 园所诊断师 =====
  {
    id: 1, name: '园所诊断师', icon: '🔍', avatarClass: 'agent1',
    title: '课程现状分析报告',
    type: 'single',
    confirmItems: [
      { id: 'swot', label: 'SWOT分析是否准确？', hint: '优势、劣势、机会、威胁分析是否符合园所实际情况' },
      { id: 'maturity', label: '课程成熟度等级是否认可？', hint: '当前评定为"发展期"第3级，是否认同' },
      { id: 'priority', label: '改进优先级是否合理？', hint: '建议优先完善课程体系化建设' }
    ],
    getOutput: (data) => {
      const features = data.features?.join('、') || '综合发展';
      const resources = data.resources?.join('、') || '周边社区';
      const goals = data.goals?.join('、') || '全面发展';
      return `【${data.name || '园所'} · 课程现状分析报告】

━━━━━━━━━━━━━━━━━━━━━━━━━━
一、优势分析 (Strengths)
━━━━━━━━━━━━━━━━━━━━━━━━━━
• 特色基础：已形成以「${features}」为核心的特色发展方向
• 资源优势：拥有${resources}等丰富的地域资源
• 师资力量：教师团队具备${data.teacher?.join('、') || '多元教学'}风格
• 规模优势：${data.classCount || 'N'}个班级，${data.studentCount || 'N'}名幼儿，规模适中

━━━━━━━━━━━━━━━━━━━━━━━━━━
二、问题分析 (Weaknesses)
━━━━━━━━━━━━━━━━━━━━━━━━━━
• 课程体系化不足：特色活动零散，缺乏系统性的课程框架
• 教师课程开发能力待提升：部分教师对园本课程理解不够深入
• 评价机制缺失：尚未建立科学的课程评价体系
• 家园共育深度不够：家长参与课程建设的机制不完善

━━━━━━━━━━━━━━━━━━━━━━━━━━
三、机会分析 (Opportunities)
━━━━━━━━━━━━━━━━━━━━━━━━━━
• 政策支持：国家大力推进学前教育质量提升
• 地域优势：${resources}资源为课程提供独特素材
• 发展需求：${data.plans?.join('、') || '课程质量提升'}的目标明确
• 社区资源：周边${data.nearbyResources?.join('、') || '社区资源丰富'}

━━━━━━━━━━━━━━━━━━━━━━━━━━
四、风险分析 (Threats)
━━━━━━━━━━━━━━━━━━━━━━━━━━
• 同质化风险：需避免课程与其他园所雷同
• 实施风险：课程改革可能遇到教师抵触
• 持续性风险：需建立长效机制防止课程建设"一阵风"
• 评价风险：缺乏科学的评价工具可能导致课程质量难以衡量

━━━━━━━━━━━━━━━━━━━━━━━━━━
五、SWOT战略矩阵
━━━━━━━━━━━━━━━━━━━━━━━━━━
          │  优势(S)          │  劣势(W)
──────────┼──────────────────┼──────────────────
  机会(O)  │ SO策略：          │ WO策略：
          │ 发挥特色优势       │ 借政策东风完善体系
          │ 深耕地域资源       │ 引进专家培训教师
──────────┼──────────────────┼──────────────────
  威胁(T)  │ ST策略：          │ WT策略：
          │ 差异化定位防同质   │ 建立课程建设制度
          │ 渐进式改革减阻力   │ 开发园本评价工具

━━━━━━━━━━━━━━━━━━━━━━━━━━
六、课程成熟度等级
━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 当前等级：★★★☆☆ 发展期（第3级/共5级）

等级说明：
  第1级 · 萌芽期：有特色意识，无系统课程
  第2级 · 起步期：有零散特色活动
  第3级 · 发展期：有明确特色方向，需系统化 ★←当前
  第4级 · 成熟期：有完整课程体系，持续优化
  第5级 · 示范期：课程成果显著，可辐射引领

📌 诊断结论：
该园课程建设基础良好，特色方向明确，资源优势突出。
建议围绕「${features}」特色，结合${resources}地域资源，
构建以${goals}为目标的系统化园本课程体系。
当前核心任务：从"有特色活动"迈向"有课程体系"。`;
    }
  },

  // ===== Agent 2: 政策研究员 =====
  {
    id: 2, name: '政策研究员', icon: '📜', avatarClass: 'agent2',
    title: '政策解读与课程建设建议',
    type: 'single',
    confirmItems: [
      { id: 'coverage', label: '省市政策是否覆盖完整？', hint: '是否遗漏了本地重要的政策文件或要求' },
      { id: 'risk', label: '风险排查是否遗漏？', hint: '政策红线排查是否全面，有无遗漏的风险点' },
      { id: 'advice', label: '迎评建议是否可行？', hint: '针对示范园评审的建议是否符合实际' }
    ],
    getOutput: (data) => {
      const location = data.location || '所在地区';
      return `【${data.name || '园所'} · 政策解读报告】

━━━━━━━━━━━━━━━━━━━━━━━━━━
一、国家层面政策分析
━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 核心政策文件：
• 《3-6岁儿童学习与发展指南》
  → 课程建设要求：以游戏为基本活动，五大领域整合发展
  
• 《幼儿园保育教育质量评估指南》
  → 课程建设要求：注重过程性评价，关注师幼互动质量
  
• 《关于学前教育深化改革规范发展的若干意见》
  → 课程改革方向：去"小学化"，推进幼儿园课程游戏化、生活化

• 《幼儿园教育指导纲要（试行）》
  → 课程建设要求：园本课程应体现地方特色和园所实际

━━━━━━━━━━━━━━━━━━━━━━━━━━
二、${location}省市政策分析
━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 省市课程建设要求：
• 落实"课程游戏化"项目建设要求
• 推进幼儿园课程改革，鼓励园本课程开发
• 加强幼儿园内涵建设，提升保教质量
• 支持幼儿园创建省/市级示范园

📋 课程改革方向：
• 从"分科教学"走向"主题整合"
• 从"教师主导"走向"儿童本位"
• 从"室内为主"走向"室内外融合"
• 从"单一评价"走向"多元评价"

━━━━━━━━━━━━━━━━━━━━━━━━━━
三、政策关键词提炼
━━━━━━━━━━━━━━━━━━━━━━━━━━
🔑 核心关键词：
  ▸ 游戏化    ▸ 生活化    ▸ 园本化
  ▸ 去小学化  ▸ 过程评价  ▸ 师幼互动
  ▸ 五大领域  ▸ 整合发展  ▸ 质量提升

━━━━━━━━━━━━━━━━━━━━━━━━━━
四、课程建设建议
━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣ 课程理念对标政策
   • 确保课程理念与《指南》精神一致
   • 突出"游戏为基本活动"的核心原则

2️⃣ 课程内容回应政策
   • 五大领域均衡发展，避免偏科
   • 将${data.features?.join('、') || '特色'}融入各领域活动

3️⃣ 课程实施遵循政策
   • 保障每日2小时户外活动
   • 杜绝"小学化"倾向

4️⃣ 课程评价对接政策
   • 建立过程性评价机制
   • 注重幼儿学习品质的培养

📌 政策契合度预判：★★★★☆（良好）
该园课程建设方向与国家及地方政策高度契合，
具备良好的政策基础和发展前景。`;
    }
  },

  // ===== Agent 3: 地域文化挖掘师 =====
  {
    id: 3, name: '地域文化挖掘师', icon: '🏞️', avatarClass: 'agent3',
    title: '地域资源挖掘与课程转化',
    type: 'single',
    confirmItems: [
      { id: 'resources', label: '资源清单是否完整？', hint: '是否还有未列出的重要地域资源需要补充' },
      { id: 'value', label: '价值评估是否准确？', hint: '资源的教育价值评分是否合理' },
      { id: 'transform', label: '转化建议是否实用？', hint: '资源→课程的转化方案是否可落地执行' }
    ],
    getOutput: (data) => {
      const resources = data.resources?.join('、') || '周边资源';
      const microEnv = data.microEnv?.join('、') || '园内环境';
      const nearby = data.nearbyResources?.join('、') || '社区资源';
      return `【${data.name || '园所'} · 地域资源挖掘报告】

━━━━━━━━━━━━━━━━━━━━━━━━━━
一、自然资源
━━━━━━━━━━━━━━━━━━━━━━━━━━
🌿 已识别自然资源：${resources}
🌿 园内微环境：${microEnv}

课程转化建议：
• 四季变化 → 科学探究活动（观察、记录、比较）
• 动植物 → 生命教育课程（饲养、种植、观察日记）
• 地形地貌 → 体能挑战课程（攀爬、平衡、探索）
• 自然材料 → 艺术创作课程（自然物拼贴、大地艺术）

━━━━━━━━━━━━━━━━━━━━━━━━━━
二、文化资源
━━━━━━━━━━━━━━━━━━━━━━━━━━
🏛️ 地域文化特色：
• 地方民俗 → 传统节日课程
• 地方美食 → 食育课程
• 地方艺术 → 美育课程
• 地方故事 → 语言课程

课程转化建议：
• 民俗体验日：每月一次地方民俗主题活动
• 小小传承人：非遗项目体验与传承
• 家乡故事会：收集整理地方传说与故事

━━━━━━━━━━━━━━━━━━━━━━━━━━
三、产业资源
━━━━━━━━━━━━━━━━━━━━━━━━━━
🏭 周边产业分析：
• 结合地方特色产业设计职业体验活动
• 利用产业场景开展社会实践课程

课程转化建议：
• 职业体验：走进工厂、农田、商铺
• 产品探究：从原材料到成品的探究之旅

━━━━━━━━━━━━━━━━━━━━━━━━━━
四、社区资源
━━━━━━━━━━━━━━━━━━━━━━━━━━
🏘️ 周边300米资源：${nearby}

课程转化建议：
• 社区地图：绘制"我的社区"资源地图
• 社区探访：定期组织社区走访活动
• 社区服务：开展小小志愿者活动
• 社区联动：与社区机构建立合作关系

━━━━━━━━━━━━━━━━━━━━━━━━━━
五、非遗资源（如有）
━━━━━━━━━━━━━━━━━━━━━━━━━━
🎭 可挖掘的非遗项目：
• 传统手工艺 → 美工区活动
• 民间游戏 → 户外活动
• 地方戏曲 → 表演区活动
• 传统节日 → 主题活动

━━━━━━━━━━━━━━━━━━━━━━━━━━
六、课程转化总体建议
━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 资源利用原则：
  1. 就近原则：优先利用周边300米资源
  2. 适宜原则：选择符合幼儿年龄特点的资源
  3. 整合原则：将多种资源有机整合到课程中
  4. 安全原则：确保所有资源利用的安全性

📌 资源转化路径：
  资源识别 → 价值分析 → 活动设计 → 课程整合 → 效果评估`;
    }
  },

  // ===== Agent 4: 特色定位专家组（多专家竞争） =====
  {
    id: 4, name: '特色定位专家组', icon: '🎯', avatarClass: 'agent4',
    title: '课程定位 · 课程名称 · 课程主张',
    type: 'multi-compete',
    confirmItems: [
      { id: 'name', label: '课程名称是否喜欢？', hint: '"XX润童 · XX成长"这个命名风格是否满意' },
      { id: 'slogan', label: '口号是否朗朗上口？', hint: '课程口号是否易于传播和记忆' },
      { id: 'position', label: '定位是否准确？', hint: '课程定位是否符合园所发展方向' }
    ],
    experts: [
      {
        name: '专家A · 教育学派专家', icon: '📚', style: '学术理论型 · 注重课程哲学与教育理念',
        getOutput: (data) => {
          const fw = getFeatureWord(data);
          const rw = getResourceWord(data);
          return `【教育学派方案】

一、课程类型建议
• 生活课程：以幼儿一日生活为载体，将${fw}教育融入生活环节
• 游戏课程：以游戏为基本活动，在游戏中实现${fw}经验建构
• 探究课程：以项目式学习为方式，支持幼儿深度探究${rw}资源

二、课程哲学
"教育即生活，生活即教育"
——让${fw}成为儿童的生活方式

三、课程特色
• 生活化：在生活中学习，在学习中生活
• 游戏化：在游戏中探索，在探索中成长
• 整合化：五大领域有机融合`;
      }
      },
      {
        name: '专家B · 品牌策划专家', icon: '💡', style: '品牌营销型 · 注重课程命名与传播策略',
        getOutput: (data) => {
          const fw = getFeatureWord(data);
          const rw = getResourceWord(data);
          const gw = getGoalWord(data);
          return `【品牌策划方案】

一、课程名称建议
🏷️ "${fw}润童 · ${gw}成长" 园本课程

二、宣传口号
📢 "${fw}相伴，${gw}同行"
📢 "在${rw}中发现，在游戏中成长"
📢 "让每一个孩子都成为${gw}的儿童"

三、招生亮点
✨ 独一无二的${rw}资源课程
✨ 专业的${fw}教育体系
✨ 可视化的${gw}成长档案
✨ 家园社协同育人模式

四、品牌定位
打造"${fw}教育"特色品牌，
成为区域内${fw}教育的标杆园所。`;
      }
      },
      {
        name: '专家C · 课程专家', icon: '📐', style: '课程设计型 · 注重课程结构与实施路径',
        getOutput: (data) => {
          const fw = getFeatureWord(data);
          const rw = getResourceWord(data);
          return `【课程专家方案】

一、课程特色
• 地域性：依托${rw}资源，课程具有不可复制性
• 生活性：贴近幼儿生活经验，学习自然发生
• 探究性：以问题为导向，支持幼儿主动学习
• 整合性：五大领域有机融合，促进全面发展

二、课程价值
• 对幼儿：在真实情境中获得完整经验
• 对教师：在课程建设中实现专业成长
• 对园所：形成独特的办园特色和品牌
• 对社区：促进社区教育资源整合

三、课程理念
"让教育回归生活，让课程回归儿童"

四、课程原则
• 儿童本位 · 游戏精神 · 生活根基 · 文化传承`;
      }
      },
      {
        name: '专家D · 儿童发展专家', icon: '👶', style: '儿童视角型 · 注重儿童发展规律与成长需求',
        getOutput: (data) => {
          const fw = getFeatureWord(data);
          const gw = getGoalWord(data);
          const child = data.child?.join('、') || '活泼好动、安静专注';
          return `【儿童发展方案】

一、儿童成长画像
👤 ${data.name || '园所'}幼儿画像：
• 行为特点：${child}
• 发展需求：需要丰富的感官体验和探究机会
• 兴趣倾向：对${fw}相关活动有天然好奇心

二、发展目标
🎯 培养"${gw}的儿童"：
• 健康的体魄 —— 在${fw}活动中锻炼身体
• 好奇的心灵 —— 在${fw}探索中激发求知欲
• 创造的双手 —— 在${fw}创作中发展创造力
• 友善的品格 —— 在${fw}合作中学会交往

三、课程对儿童发展的支持
• 认知发展：提供丰富的直接经验
• 语言发展：创造真实的交流情境
• 社会性发展：提供合作与分享的机会
• 情感发展：建立与自然的积极情感联结`;
      }
      }
    ],
    refereeOutput: (data, expertResults) => {
      const fw = getFeatureWord(data);
      const rw = getResourceWord(data);
      const gw = getGoalWord(data);
      return `━━━━━━━━━━━━━━━━━━━━━━━━━━
🏅 定位裁判 · 综合评审
━━━━━━━━━━━━━━━━━━━━━━━━━━

经综合评估四位专家方案，裁判组做出以下裁决：

📊 各方案评分：
  专家A（教育学派）：★★★★☆ 理念扎实，学术性强
  专家B（品牌策划）：★★★★★ 定位清晰，传播力强
  专家C（课程专家）：★★★★☆ 结构完整，操作性强
  专家D（儿童发展）：★★★★☆ 儿童视角，发展导向

🏆 最优推荐：综合专家B的品牌定位 + 专家C的课程框架

━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 最终课程定位
━━━━━━━━━━━━━━━━━━━━━━━━━━

【课程名称】
"${fw}润童 · ${gw}成长" 园本课程

【课程主张】
在${rw}中发现
在游戏中建构
在生活中成长

【课程口号】
"${fw}相伴，${gw}同行"

【课程定位解读】
本课程以「${fw}」为核心特色，充分挖掘「${rw}」资源的教育价值，
致力于培养「${gw}」的完整儿童。
课程强调儿童与环境的深度互动，在真实情境中支持幼儿
主动探究、自主建构、自然成长。`;
    }
  },

  // ===== Agent 5: 课程架构师（多专家协同） =====
  {
    id: 5, name: '课程架构师', icon: '🏗️', avatarClass: 'agent5',
    title: '课程理念 · 课程目标 · 课程结构',
    type: 'multi-collab',
    confirmItems: [
      { id: 'philosophy', label: '课程理念是否认同？', hint: '核心理念和分支理念是否符合园所教育观' },
      { id: 'goals', label: '目标体系是否合理？', hint: '总目标→领域目标→年龄段目标的分解是否恰当' },
      { id: 'framework', label: '课程框架比例是否合适？', hint: '基础60%+特色30%+拓展10%的配比是否合理' },
      { id: 'modules', label: '模块划分是否清晰？', hint: '自然/生活/游戏/项目四大模块的划分是否合理' }
    ],
    experts: [
      {
        name: '专家A · 教育学专家', icon: '📖', style: '理念建构型 · 注重课程哲学与教育信念',
        getOutput: (data) => {
          const fw = getFeatureWord(data);
          return `【课程理念】

一、核心信念
「每个孩子都是天生的探索者，
  课程是支持他们与周遭世界对话的桥梁。」

二、理念体系
1. 儿童本位
   尊重幼儿的年龄特点与个体差异，
   以儿童的兴趣和需要为课程起点。

2. 生活即教育
   将${fw}教育融入幼儿一日生活，
   让教育在真实情境中自然发生。

3. 游戏为基本活动
   保障幼儿自主游戏的权利，
   在游戏中实现深度学习。

4. 家园社协同
   整合家庭、社区资源，
   构建"没有围墙的课程"。

5. 文化传承
   扎根地域文化，培养文化认同，
   让幼儿在${fw}中建立归属感。`;
      }
      },
      {
        name: '专家B · 课程专家', icon: '🎯', style: '目标导向型 · 注重课程目标与领域整合',
        getOutput: (data) => {
          const gw = getGoalWord(data);
          const features = data.features?.join('、') || '特色';
          return `【课程目标】

一、总目标
培养「${gw}」的完整儿童

二、领域目标（对接《3-6岁儿童学习与发展指南》）
• 健康领域：身心状况良好，动作协调发展
• 语言领域：倾听与表达，阅读与书写准备
• 社会领域：人际交往，社会适应
• 科学领域：科学探究，数学认知
• 艺术领域：感受与欣赏，表现与创造

三、特色目标
• 资源感知力：能主动发现并利用${data.resources?.join('、') || '周边'}资源
• 文化认同感：建立对本土文化的热爱与归属感
• 探究习惯：养成观察、提问、验证的科学思维
• 表达能力：能用多种方式表达自己的发现与感受

四、年龄段目标
小班：感知与体验 —— 用感官认识世界
中班：探索与发现 —— 用工具探索世界
大班：表达与创造 —— 用符号表达世界`;
      }
      },
      {
        name: '专家C · 课程设计专家', icon: '📋', style: '结构设计型 · 注重课程框架与模块划分',
        getOutput: (data) => {
          const fw = getFeatureWord(data);
          return `【课程结构】

一、课程框架
┌──────────────────────────────────────┐
│           基础性课程（60%）            │
│  省编教材 + 五大领域基础活动           │
├──────────────────────────────────────┤
│           特色性课程（30%）            │
│  ${fw}主题课程 + 地域资源课程          │
├──────────────────────────────────────┤
│           拓展性课程（10%）            │
│  社团活动 + 节日活动 + 生成课程         │
└──────────────────────────────────────┘

二、课程模块
🌿 自然课程模块
   • 四季探索 · 种植饲养 · 自然艺术 · 生态教育

🏠 生活课程模块
   • 自我服务 · 生活礼仪 · 安全教育 · 食育课程

🎮 游戏课程模块
   • 自主游戏 · 规则游戏 · 建构游戏 · 角色游戏

📋 项目课程模块
   • 主题探究 · 问题解决 · 成果展示 · 项目汇报

三、课程实施比例
  基础课程 60% → 保障全面发展
  特色课程 30% → 凸显园本特色
  拓展课程 10% → 满足个性需求`;
      }
      }
    ]
  },

  // ===== Agent 6: 课程地图设计师 =====
  {
    id: 6, name: '课程地图设计师', icon: '🗺️', avatarClass: 'agent6',
    title: '小班 · 中班 · 大班 课程进阶路径',
    type: 'single',
    confirmItems: [
      { id: 'path', label: '进阶路径是否符合幼儿发展规律？', hint: '感知体验→探索发现→表达创造的递进是否合理' },
      { id: 'themes', label: '主题选择是否合适？', hint: '各年龄段的主题设置是否符合园所实际' },
      { id: 'schedule', label: '时间安排是否合理？', hint: '学年课程日历的节奏和密度是否恰当' },
      { id: 'resources', label: '资源是否可获取？', hint: '主题资源包中的材料是否方便获取' }
    ],
    getOutput: (data) => {
      const fw = getFeatureWord(data);
      const features = data.features?.join('、') || '特色';
      return `【${data.name || '园所'} · 课程进阶体系】

━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 三年进阶路径总览
━━━━━━━━━━━━━━━━━━━━━━━━━━

┌──────────┬─────────────────┬─────────────────┬─────────────────┐
│   维度    │   小班（3-4岁）   │   中班（4-5岁）   │   大班（5-6岁）   │
├──────────┼─────────────────┼─────────────────┼─────────────────┤
│ 核心经验  │ 感知与体验        │ 探索与发现        │ 表达与创造        │
│          │ 用感官认识世界     │ 用工具探索世界     │ 用符号表达世界     │
├──────────┼─────────────────┼─────────────────┼─────────────────┤
│ 主题词    │ 我身边的...       │ 我发现的...       │ 我创造的...       │
├──────────┼─────────────────┼─────────────────┼─────────────────┤
│ 学习方式  │ 模仿→体验         │ 操作→发现         │ 合作→探究         │
├──────────┼─────────────────┼─────────────────┼─────────────────┤
│ 教师角色  │ 陪伴者 + 引导者    │ 支持者 + 观察者    │ 合作者 + 推动者    │
├──────────┼─────────────────┼─────────────────┼─────────────────┤
│ 特色活动  │ ${fw}散步、感官游戏 │ ${fw}观察、实地探访 │ ${fw}探究、成果展示  │
│ 示例      │ 收集树叶、玩沙玩水 │ 记录生长、社区走访 │ 策展汇报、亲子工坊 │
├──────────┼─────────────────┼─────────────────┼─────────────────┤
│ 关键能力  │ 好奇心、安全感     │ 专注力、规则意识   │ 计划性、合作力     │
├──────────┼─────────────────┼─────────────────┼─────────────────┤
│ 评价重点  │ 参与度、情绪状态   │ 探究过程、同伴交往 │ 问题解决、创意表达  │
└──────────┴─────────────────┴─────────────────┴─────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━
🔄 进阶逻辑
━━━━━━━━━━━━━━━━━━━━━━━━━━

小班「感知体验」→ 中班「探索发现」→ 大班「表达创造」
形成螺旋上升的课程进阶路径，三年为一个完整成长周期。

━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 各年龄段特色融合
━━━━━━━━━━━━━━━━━━━━━━━━━━

🌱 小班阶段（3-4岁）
  主题：我身边的${fw}
  目标：建立与${fw}的积极情感联结
  活动：${fw}散步、自然收集、感官游戏、简单观察
  成果：${fw}收集册、感官体验记录

🌿 中班阶段（4-5岁）
  主题：我发现的${fw}
  目标：发展${fw}探究的基本能力
  活动：种植观察、实地探访、简单实验、记录分享
  成果：观察日记、探访地图、探究报告

🌳 大班阶段（5-6岁）
  主题：我创造的${fw}
  目标：运用${fw}经验进行创造性表达
  活动：项目探究、策展汇报、亲子工坊、社区展示
  成果：项目报告、创意作品展、${fw}故事集

━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 课程地图使用说明
━━━━━━━━━━━━━━━━━━━━━━━━━━
• 横向：每个年龄段有完整的学期课程计划
• 纵向：三年课程形成螺旋上升的进阶体系
• 特色线：${features}特色贯穿三个年龄段
• 弹性空间：预留20%生成课程空间`;
    }
  },

  // ===== Agent 7: 课程实施专家组（4专家） =====
  {
    id: 7, name: '课程实施专家组', icon: '📐', avatarClass: 'agent7',
    title: '课程实施方案',
    type: 'multi-collab',
    confirmItems: [
      { id: 'env', label: '环境改造是否可行？', hint: '考虑预算、空间等实际条件是否允许' },
      { id: 'schedule', label: '一日流程是否合理？', hint: '优化后的作息表是否可落地执行' },
      { id: 'materials', label: '材料投放是否可获取？', hint: '区域材料清单中的物品是否方便采购或自制' },
      { id: 'home', label: '家园活动频次是否合适？', hint: '每月活动安排是否会给家长和教师造成负担' }
    ],
    experts: [
      {
        name: '专家A · 环境创设专家', icon: '🏠', style: '空间设计型 · 注重物理与心理环境创设',
        getOutput: (data) => {
          const fw = getFeatureWord(data);
          return `【环境创设方案】

一、户外环境
• ${fw}探索区：沙池、水池、种植园、小山坡
• 运动挑战区：攀爬架、平衡木、骑行道
• 艺术创作区：涂鸦墙、自然材料区、音乐角
• 休闲交往区：小木屋、帐篷、阅读角

二、室内环境
• ${fw}主题墙：随主题推进动态更新
• 区域材料投放：结合${fw}特色投放低结构材料
• 作品展示区：展示幼儿${fw}探究过程与成果
• 亲子互动区：家长参与${fw}活动的展示空间

三、心理环境
• 尊重接纳的师幼关系
• 鼓励探究的班级氛围
• 支持表达的语言环境
• 允许试错的安全空间`;
      }
      },
      {
        name: '专家B · 一日生活专家', icon: '⏰', style: '流程优化型 · 注重一日生活流程与环节渗透',
        getOutput: (data) => {
          const fw = getFeatureWord(data);
          return `【一日生活方案】

一、一日流程设计
┌──────────┬────────────────────────────┐
│  时间段   │          活动内容            │
├──────────┼────────────────────────────┤
│ 8:00-9:00│ 入园 · ${fw}晨间活动          │
│ 9:00-10:00│ ${fw}主题集体活动            │
│ 10:00-11:00│ 户外${fw}探索活动           │
│ 11:00-12:00│ 午餐 · ${fw}食育环节         │
│ 12:00-14:30│ 午睡                        │
│ 14:30-15:30│ ${fw}区域游戏活动            │
│ 15:30-16:00│ ${fw}分享回顾环节            │
│ 16:00-17:00│ 离园 · ${fw}亲子任务         │
└──────────┴────────────────────────────┘

二、生活环节中的${fw}渗透
• 入园：${fw}观察日记记录
• 餐点：${fw}食材认知与感恩
• 散步：${fw}自然观察与发现
• 离园：${fw}亲子任务布置`;
      }
      },
      {
        name: '专家C · 区域活动专家', icon: '🧩', style: '活动设计型 · 注重区域材料投放与玩法设计',
        getOutput: (data) => {
          const fw = getFeatureWord(data);
          return `【区域活动方案】

一、常规区域
• 语言区：${fw}绘本、故事创编、前书写
• 科学区：${fw}观察工具、实验材料、记录表
• 美工区：${fw}自然材料、多元工具、展示空间
• 建构区：${fw}场景搭建、模型制作
• 角色区：${fw}主题角色扮演（如小农夫、小科学家）

二、特色区域
• ${fw}探索站：主题探究材料包
• ${fw}创客空间：低结构材料自由创作
• ${fw}博物馆：幼儿收集品的展示与探究

三、材料投放原则
• 低结构化：支持多种玩法
• 层次性：满足不同发展水平
• 动态性：随主题推进更新
• 开放性：支持创造性使用`;
      }
      },
      {
        name: '专家D · 家园共育专家', icon: '👨‍👩‍👧', style: '协同育人型 · 注重家长参与与社区资源整合',
        getOutput: (data) => {
          const fw = getFeatureWord(data);
          return `【家园共育方案】

一、家长参与机制
• ${fw}家长志愿者：参与${fw}活动组织
• ${fw}亲子工作坊：每月1次亲子活动
• ${fw}家长课堂：分享家长的专业资源
• ${fw}家庭任务：周末亲子${fw}探索

二、家园沟通渠道
• ${fw}课程周报：每周推送课程动态
• ${fw}成长档案：记录幼儿${fw}学习故事
• ${fw}家长沙龙：每学期2次交流分享
• ${fw}开放日：每学期1次课程展示

三、社区资源整合
• 建立${fw}资源地图
• 发展${fw}合作基地
• 邀请社区人士入园
• 组织社区${fw}实践活动`;
      }
      }
    ]
  },

  // ===== Agent 8: 课程评价专家组 =====
  {
    id: 8, name: '课程评价专家组', icon: '📊', avatarClass: 'agent8',
    title: '完整评价体系',
    type: 'single',
    confirmItems: [
      { id: 'dimensions', label: '评价维度是否全面？', hint: '儿童发展+教师成长+课程质量+家园共育四维是否覆盖完整' },
      { id: 'tools', label: '评价工具是否实用？', hint: '是否会增加教师负担，频次是否合理' },
      { id: 'cycle', label: '评价周期是否合理？', hint: '日常观察→月汇总→学期评价→学年诊断的节奏是否合适' }
    ],
    getOutput: (data) => {
      const gw = getGoalWord(data);
      return `【${data.name || '园所'} · 课程评价体系】

━━━━━━━━━━━━━━━━━━━━━━━━━━
一、评价理念
━━━━━━━━━━━━━━━━━━━━━━━━━━
• 发展性评价：关注过程而非结果，看见成长而非差距
• 多元主体评价：教师、幼儿、家长、管理者共同参与
• 嵌入式评价：评价融入日常活动，而非额外负担
• 循证评价：基于观察记录、作品分析等真实证据

━━━━━━━━━━━━━━━━━━━━━━━━━━
二、儿童发展评价
━━━━━━━━━━━━━━━━━━━━━━━━━━

┌────────────┬──────────────────────────────────┐
│  评价维度   │             关键指标               │
├────────────┼──────────────────────────────────┤
│ 健康与运动  │ 体能发展、生活习惯、安全自护          │
│ 语言与交流  │ 倾听理解、表达沟通、阅读兴趣          │
│ 社会与情感  │ 自我认知、人际交往、情绪管理          │
│ 科学与探究  │ 观察发现、提问验证、数理逻辑          │
│ 艺术与创造  │ 感受欣赏、表现表达、想象创造          │
│ 学习品质    │ 好奇心、专注力、坚持性、计划性        │
└────────────┴──────────────────────────────────┘

评价工具：
• 幼儿学习故事（每周2-3篇）
• 幼儿发展检核表（每月1次）
• 幼儿作品档案袋（持续积累）
• 幼儿自评与互评（大班）

━━━━━━━━━━━━━━━━━━━━━━━━━━
三、教师成长评价
━━━━━━━━━━━━━━━━━━━━━━━━━━

┌────────────┬──────────────────────────────────┐
│  评价维度   │             关键指标               │
├────────────┼──────────────────────────────────┤
│ 课程理解力  │ 对园本课程理念的认同与践行程度        │
│ 课程设计力  │ 主题设计与活动组织的专业水平          │
│ 观察评价力  │ 幼儿行为观察与记录分析能力            │
│ 反思改进力  │ 基于证据的课程反思与调整能力          │
│ 家园沟通力  │ 与家长有效沟通与合作的能力            │
└────────────┴──────────────────────────────────┘

评价工具：
• 教师课程反思日志（每周1篇）
• 教师观察记录质量评估（每月1次）
• 教师专业成长档案（每学期更新）
• 同伴互评与教研评议

━━━━━━━━━━━━━━━━━━━━━━━━━━
四、课程质量评价
━━━━━━━━━━━━━━━━━━━━━━━━━━

┌────────────┬──────────────────────────────────┐
│  评价维度   │             关键指标               │
├────────────┼──────────────────────────────────┤
│ 适宜性      │ 是否符合幼儿年龄特点与发展需要        │
│ 特色性      │ 是否体现${gw}的园本特色              │
│ 整合性      │ 五大领域是否有机融合                 │
│ 操作性      │ 实施路径是否清晰可行                 │
│ 有效性      │ 是否促进幼儿全面发展                 │
└────────────┴──────────────────────────────────┘

评价工具：
• 主题课程审议表（每个主题1次）
• 课程质量自评量表（每学期1次）
• 半日活动质量评估（每月1次）
• 课程资源审核表（每学期1次）

━━━━━━━━━━━━━━━━━━━━━━━━━━
五、家园共育评价
━━━━━━━━━━━━━━━━━━━━━━━━━━

评价工具：
• 家长满意度问卷（每学期1次）
• 家长参与度记录（持续记录）
• 家园沟通质量评估（每月1次）
• 亲子活动效果反馈（每次活动后）

━━━━━━━━━━━━━━━━━━━━━━━━━━
六、评价结果运用
━━━━━━━━━━━━━━━━━━━━━━━━━━
• 为每个幼儿建立"成长档案"
• 评价结果反馈至课程修订
• 形成《学期课程质量报告》
• 支持教师专业发展规划

📌 评价周期：日常观察 → 每月汇总 → 学期评价 → 学年诊断`;
    }
  },

  // ===== Agent 9: 课程评审委员会 =====
  {
    id: 9, name: '课程评审委员会', icon: '🏅', avatarClass: 'agent9',
    title: '课程评审与优化建议',
    type: 'review',
    confirmItems: [
      { id: 'review', label: '评审意见是否接受？', hint: '五维打分和专家评语是否认可' },
      { id: 'priority', label: '修改优先级是否认可？', hint: '回流优化的优先级排序是否合理' },
      { id: 'tasks', label: '优化任务分配是否合理？', hint: '各项优化任务的负责人和截止时间是否恰当' }
    ],
    getOutput: (data) => {
      const fw = getFeatureWord(data);
      const gw = getGoalWord(data);
      const rw = getResourceWord(data);
      return `【${data.name || '园所'} · 课程评审报告】

━━━━━━━━━━━━━━━━━━━━━━━━━━
🏛️ 评审委员会组成
━━━━━━━━━━━━━━━━━━━━━━━━━━
• 教育局评审专家  —— 从政策合规角度评审
• 课程比赛评委    —— 从课程创新角度评审
• 示范园评审专家  —— 从示范引领角度评审
• 集团园课程专家  —— 从落地实操角度评审

━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 五维评审打分
━━━━━━━━━━━━━━━━━━━━━━━━━━

┌────────────────┬───────┬──────────────────────────┐
│    评审维度     │ 得分  │        专家点评            │
├────────────────┼───────┼──────────────────────────┤
│ 课程先进性      │ 88/100│ 理念先进，符合当前课改方向  │
│ 课程逻辑性      │ 85/100│ 结构清晰，进阶路径合理      │
│ 课程特色性      │ 92/100│ ${fw}特色鲜明，差异化突出    │
│ 课程落地性      │ 82/100│ 实施路径明确，需加强保障    │
│ 政策契合度      │ 90/100│ 高度契合国家与地方政策      │
├────────────────┼───────┼──────────────────────────┤
│ 综合得分        │ 87.4  │ ★★★★☆ 优秀              │
└────────────────┴───────┴──────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 各专家详细评审
━━━━━━━━━━━━━━━━━━━━━━━━━━

👔 教育局评审专家：
  "课程方案符合《指南》精神，体现了游戏化、生活化的课程理念。
   建议进一步明确与省编教材的衔接关系。"

🏆 课程比赛评委：
  "课程定位'${fw}润童 · ${gw}成长'具有鲜明的辨识度，
   ${rw}资源的课程转化设计有创意。建议加强成果可视化呈现。"

🏫 示范园评审专家：
  "课程体系完整，具备示范引领潜力。
   建议建立课程资源库，形成可推广的课程模式。"

👨‍🏫 集团园课程专家：
  "实施方案操作性强，教师培训计划具体。
   建议增加课程审议机制，确保课程动态优化。"

━━━━━━━━━━━━━━━━━━━━━━━━━━
🔧 修改建议
━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣ 课程理念层面
   • 进一步凝练课程哲学表述
   • 增加课程愿景的描绘

2️⃣ 课程内容层面
   • 丰富${fw}主题活动的层次性
   • 加强五大领域的融合度

3️⃣ 课程实施层面
   • 细化教师培训方案
   • 建立课程审议制度
   • 完善资源保障机制

4️⃣ 课程评价层面
   • 开发园本评价工具
   • 建立评价反馈闭环

━━━━━━━━━━━━━━━━━━━━━━━━━━
🔄 回流优化建议
━━━━━━━━━━━━━━━━━━━━━━━━━━

根据评审意见，建议按以下优先级进行回流优化：

第一优先级（立即优化）：
  ✅ 明确与省编教材的衔接关系
  ✅ 建立课程审议机制

第二优先级（本学期内）：
  ✅ 开发园本评价工具
  ✅ 建立课程资源库

第三优先级（持续优化）：
  ✅ 形成可推广的课程模式
  ✅ 积累课程建设成果

📌 评审结论：
该园本课程方案整体质量优秀，特色鲜明，结构完整，
具备良好的落地基础和示范潜力。
建议按照上述意见进行优化后，可作为区域园本课程建设范例推广。`;
    }
  }
];

// ========== Navigation Functions ==========
function startApp() {
  document.getElementById('welcomeOverlay').classList.add('hidden');
  document.getElementById('appContainer').style.display = 'flex';
  updateNavButtons();
}

// ========== Guest Demo Mode ==========
const guestDemoData = {
  name: '北京东城区红星幼儿园',
  location: '北京市东城区',
  type: '公办',
  classCount: '12',
  studentCount: '360',
  features: ['自然教育', '劳动教育', '科学教育'],
  resources: ['社区公园', '城市菜园', '青少年科技馆', '老年活动中心'],
  goals: ['健康儿童', '探究儿童', '创造儿童', '友善儿童'],
  plans: ['创建区级示范园', '申报课程建设成果奖'],
  microEnv: ['沙水区', '种植园', '攀爬墙', '阅读角', '美工区'],
  nearbyResources: ['社区公园', '小菜场', '图书馆', '消防站'],
  teacher: ['亲和型'],
  child: ['好奇好动', '喜欢探究']
};

async function loadGuestDemo() {
  const user = getCurrentUser();
  if (!user || !user.isGuest) return;

  // 1. 填充表单
  document.getElementById('f_name').value = guestDemoData.name;
  document.getElementById('f_location').value = guestDemoData.location;
  document.getElementById('f_type').value = guestDemoData.type;
  document.getElementById('f_classCount').value = guestDemoData.classCount;
  document.getElementById('f_studentCount').value = guestDemoData.studentCount;
  document.getElementById('cf_features').value = guestDemoData.features.join('、');
  document.getElementById('cf_resources').value = guestDemoData.resources.join('、');
  document.getElementById('cf_goals').value = guestDemoData.goals.join('、');
  document.getElementById('cf_plans').value = guestDemoData.plans.join('、');
  document.getElementById('cu_micro_env').value = guestDemoData.microEnv.join('、');
  document.getElementById('cu_nearby').value = guestDemoData.nearbyResources.join('、');
  document.getElementById('cu_teacher').value = guestDemoData.teacher.join('、');
  document.getElementById('cu_child').value = guestDemoData.child.join('、');

  updateFormProgress();

  // 2. 自动提交并运行全部 9 个 Agent
  submitForm();
}

function goToStep(step) {
  if (step > state.maxUnlockedStep) return;
  if (state.isGenerating) return;
  state.currentStep = step;
  renderStep();
  updateNavButtons();
}

function updateNavButtons() {
  document.querySelectorAll('.step-nav button').forEach(btn => {
    const s = parseInt(btn.dataset.step);
    btn.classList.remove('active', 'completed');
    if (s === state.currentStep) btn.classList.add('active');
    if (s < state.maxUnlockedStep) btn.classList.add('completed');
    btn.disabled = s > state.maxUnlockedStep;
  });
}

function renderStep() {
  document.querySelectorAll('.step-content').forEach(el => el.classList.remove('active'));
  const stepEl = document.getElementById('step' + state.currentStep);
  if (stepEl) stepEl.classList.add('active');
  updateNavButtons();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateFormProgress() {
  const totalFields = 12;
  let filled = 0;
  if (document.getElementById('f_name').value) filled++;
  if (document.getElementById('f_location').value) filled++;
  if (document.getElementById('f_type').value) filled++;
  if (document.getElementById('f_classCount').value) filled++;
  if (document.getElementById('f_studentCount').value) filled++;
  if (document.getElementById('cf_features').value.trim()) filled++;
  if (document.getElementById('cf_resources').value.trim()) filled++;
  if (document.getElementById('cf_goals').value.trim()) filled++;
  if (document.getElementById('cf_plans').value.trim()) filled++;
  if (document.getElementById('cu_micro_env').value.trim()) filled++;
  if (document.getElementById('cu_nearby').value.trim()) filled++;
  if (document.getElementById('cu_teacher').value.trim() || document.getElementById('cu_child').value.trim()) filled++;
  const pct = Math.min(100, Math.round((filled / totalFields) * 100));
  document.getElementById('formProgress').style.width = pct + '%';
}

// ========== Form Submit ==========
function submitForm() {
  const data = collectFormData();
  if (!data.name || data.name === '未命名园所') {
    alert('请至少填写园所名称');
    return;
  }
  state.formData = data;
  state.maxUnlockedStep = 1;
  state.currentStep = 1;
  renderStep();
  runAgent(0);
}

// ========== Agent Runner ==========
async function runAgent(index) {
  if (index >= agents.length) {
    state.maxUnlockedStep = 10;
    state.isGenerating = false;
    buildReport();
    goToStep(10);
    return;
  }
  state.isGenerating = true;
  state.maxUnlockedStep = index + 1;
  state.currentStep = index + 1;
  const agent = agents[index];
  const stepEl = document.getElementById('step' + (index + 1));

  if (agent.type === 'multi-compete') {
    await runMultiCompeteAgent(agent, stepEl, index);
  } else if (agent.type === 'multi-collab') {
    await runMultiCollabAgent(agent, stepEl, index);
  } else if (agent.type === 'review') {
    await runReviewAgent(agent, stepEl, index);
  } else {
    await runSingleAgent(agent, stepEl, index);
  }
}

// ========== Single Agent ==========
async function runSingleAgent(agent, stepEl, index) {
  stepEl.innerHTML = `
    <div class="card">
      <div class="agent-header">
        <div class="agent-avatar ${agent.avatarClass}">
          ${agent.icon}
          <div class="pulse"></div>
        </div>
        <div class="agent-info">
          <h3>${agent.name}</h3>
          <div class="agent-role">输出：${agent.title}</div>
        </div>
        <div class="agent-status"><span class="dot"></span> 正在分析中...</div>
      </div>
      <div class="agent-output typing-cursor" id="agentOutput${index}"></div>
    </div>
    <div class="step-footer">
      <span class="hint">⏳ AI专家正在深度分析园所数据...</span>
      <span></span>
    </div>
  `;
  renderStep();

  const output = agent.getOutput(state.formData);
  const outputEl = document.getElementById('agentOutput' + index);
  await typeText(output, outputEl, 12);

  finishAgent(agent, stepEl, index, output);
}

// ========== Multi-Compete Agent (Agent 4) ==========
async function runMultiCompeteAgent(agent, stepEl, index) {
  const experts = agent.experts;
  const avatarClasses = ['avatar-a', 'avatar-b', 'avatar-c', 'avatar-d'];
  let expertCards = experts.map((e, i) => `
    <div class="expert-card" id="expertCard${index}_${i}">
      <div class="expert-header">
        <div class="expert-avatar ${avatarClasses[i]}">${e.icon}</div>
        <div class="expert-meta">
          <div class="expert-name">${e.name}</div>
          <div class="expert-style">${e.style || ''}</div>
        </div>
      </div>
      <div class="expert-output typing-cursor" id="expertOutput${index}_${i}"></div>
    </div>
  `).join('');

  stepEl.innerHTML = `
    <div class="card">
      <div class="agent-header">
        <div class="agent-avatar ${agent.avatarClass}">
          ${agent.icon}
          <div class="pulse"></div>
        </div>
        <div class="agent-info">
          <h3>${agent.name}</h3>
          <div class="agent-role">4位专家同时生成方案 · 定位裁判择优推荐</div>
        </div>
        <div class="agent-status"><span class="dot"></span> 多专家并行分析中...</div>
      </div>
      <div class="expert-panel">${expertCards}</div>
      <div class="referee-panel" id="refereePanel${index}" style="display:none;">
        <h4>🏅 定位裁判 · 综合评审</h4>
        <div class="agent-output" id="refereeOutput${index}"></div>
      </div>
    </div>
    <div class="step-footer">
      <span class="hint">⏳ 4位专家正在并行生成方案...</span>
      <span></span>
    </div>
  `;
  renderStep();

  // Run all 4 experts in parallel
  const expertResults = [];
  const promises = experts.map(async (expert, i) => {
    const output = expert.getOutput(state.formData);
    expertResults[i] = output;
    const el = document.getElementById('expertOutput' + index + '_' + i);
    await typeText(output, el, 8);
    el.classList.remove('typing-cursor');
  });
  await Promise.all(promises);

  // Show referee
  const refereePanel = document.getElementById('refereePanel' + index);
  refereePanel.style.display = 'block';
  const refereeEl = document.getElementById('refereeOutput' + index);
  const refereeText = agent.refereeOutput(state.formData, expertResults);
  await typeText(refereeText, refereeEl, 10);

  // Highlight best expert
  document.getElementById('expertCard' + index + '_1').classList.add('selected');

  const fullOutput = expertResults.map((r, i) => `【${experts[i].name}方案】\n${r}`).join('\n\n') + '\n\n' + refereeText;
  finishAgent(agent, stepEl, index, fullOutput);
}

// ========== Multi-Collab Agent (Agent 5, 7) ==========
async function runMultiCollabAgent(agent, stepEl, index) {
  const experts = agent.experts;
  const avatarClasses = ['avatar-a', 'avatar-b', 'avatar-c', 'avatar-d'];
  let expertCards = experts.map((e, i) => `
    <div class="expert-card" id="expertCard${index}_${i}">
      <div class="expert-header">
        <div class="expert-avatar ${avatarClasses[i]}">${e.icon}</div>
        <div class="expert-meta">
          <div class="expert-name">${e.name}</div>
          <div class="expert-style">${e.style || ''}</div>
        </div>
      </div>
      <div class="expert-output typing-cursor" id="expertOutput${index}_${i}"></div>
    </div>
  `).join('');

  stepEl.innerHTML = `
    <div class="card">
      <div class="agent-header">
        <div class="agent-avatar ${agent.avatarClass}">
          ${agent.icon}
          <div class="pulse"></div>
        </div>
        <div class="agent-info">
          <h3>${agent.name}</h3>
          <div class="agent-role">${experts.length}位专家协同工作 · 输出：${agent.title}</div>
        </div>
        <div class="agent-status"><span class="dot"></span> 多专家协同分析中...</div>
      </div>
      <div class="expert-panel">${expertCards}</div>
    </div>
    <div class="step-footer">
      <span class="hint">⏳ ${experts.length}位专家正在协同工作...</span>
      <span></span>
    </div>
  `;
  renderStep();

  // Run experts sequentially for collab
  const expertResults = [];
  for (let i = 0; i < experts.length; i++) {
    const output = experts[i].getOutput(state.formData);
    expertResults[i] = output;
    const el = document.getElementById('expertOutput' + index + '_' + i);
    await typeText(output, el, 10);
    el.classList.remove('typing-cursor');
  }

  const fullOutput = expertResults.map((r, i) => `【${experts[i].name}】\n${r}`).join('\n\n');
  finishAgent(agent, stepEl, index, fullOutput);
}

// ========== Review Agent (Agent 9) ==========
async function runReviewAgent(agent, stepEl, index) {
  stepEl.innerHTML = `
    <div class="card">
      <div class="agent-header">
        <div class="agent-avatar ${agent.avatarClass}">
          ${agent.icon}
          <div class="pulse"></div>
        </div>
        <div class="agent-info">
          <h3>${agent.name}</h3>
          <div class="agent-role">教育局专家 · 比赛评委 · 示范园专家 · 集团园专家 联合评审</div>
        </div>
        <div class="agent-status"><span class="dot"></span> 评审委员会评审中...</div>
      </div>
      <div class="agent-output typing-cursor" id="agentOutput${index}"></div>
    </div>
    <div class="step-footer">
      <span class="hint">⏳ 评审委员会正在综合打分...</span>
      <span></span>
    </div>
  `;
  renderStep();

  const output = agent.getOutput(state.formData);
  const outputEl = document.getElementById('agentOutput' + index);
  await typeText(output, outputEl, 10);

  finishAgent(agent, stepEl, index, output);
}

// ========== Typing Animation ==========
function typeText(text, el, speed) {
  return new Promise(resolve => {
    let i = 0;
    function typeChar() {
      if (i < text.length) {
        el.textContent += text[i];
        i++;
        el.scrollIntoView({ behavior: 'smooth', block: 'end' });
        setTimeout(typeChar, Math.random() * 15 + speed);
      } else {
        resolve();
      }
    }
    typeChar();
  });
}

// ========== Finish Agent (Show Confirmation Gate) ==========
function finishAgent(agent, stepEl, index, output) {
  // Remove pulse
  const avatar = stepEl.querySelector('.agent-avatar .pulse');
  if (avatar) avatar.remove();

  // Update status
  const status = stepEl.querySelector('.agent-status');
  if (status) status.innerHTML = '<span style="color:var(--success)">✅ 分析完成</span>';

  state.agentResults[agent.id] = output;
  state.currentAgentIndex = index;
  state.isGenerating = false;

  // Build confirmation panel
  const confirmItems = agent.confirmItems || [];
  const confirmHtml = confirmItems.map((item, i) => `
    <div class="confirm-item" id="confirmItem_${index}_${i}">
      <label class="confirm-checkbox">
        <input type="checkbox" onchange="onConfirmCheck(${index})" data-agent="${index}" data-item="${i}">
        <span class="checkmark"></span>
        <span class="confirm-label">${item.label}</span>
      </label>
      <div class="confirm-hint">${item.hint}</div>
    </div>
  `).join('');

  const nextIndex = index + 1;
  const nextLabel = nextIndex < agents.length ? '确认并进入下一步 →' : '确认并查看报告 →';

  // Build collaboration options
  const collabOptions = [
    { mode: 'option', icon: '🎯', label: '选项引导', desc: 'AI提供替代方案供选择' },
    { mode: 'chat', icon: '💬', label: '对话探讨', desc: '与AI专家深入讨论' },
    { mode: 'annotate', icon: '📝', label: '批注修改', desc: '在具体内容上标注修改意见' }
  ];

  const collabHtml = collabOptions.map(c => `
    <button class="collab-option-btn" onclick="startCollaboration(${index}, '${c.mode}')" id="collabBtn_${index}_${c.mode}">
      <span class="collab-option-icon">${c.icon}</span>
      <span class="collab-option-label">${c.label}</span>
      <span class="collab-option-desc">${c.desc}</span>
    </button>
  `).join('');

  // Update footer with confirmation gate
  const footer = stepEl.querySelector('.step-footer');
  if (footer) {
    footer.outerHTML = `
      <div class="confirm-gate" id="confirmGate${index}">
        <div class="confirm-gate-header">
          <h4>🔐 人工确认门控</h4>
          <p>请园长/教研主任逐项确认以下内容，确认后进入下一环节</p>
        </div>
        <div class="confirm-items-list">
          ${confirmHtml}
        </div>
        <div class="confirm-actions">
          <button class="btn btn-primary" id="btnConfirm${index}" onclick="confirmAgent(${index})" disabled>
            ✅ ${nextLabel}
          </button>
        </div>
        <div class="collab-divider">
          <span>有异议？选择协作方式与AI专家共同探讨</span>
        </div>
        <div class="collab-options">
          ${collabHtml}
        </div>
        <div class="collab-panel" id="collabPanel${index}" style="display:none;"></div>
      </div>
    `;
  }

  updateNavButtons();

  // 游客模式：自动连续运行全部 Agent
  if (typeof isGuestUser === 'function' && isGuestUser()) {
    setTimeout(function() {
      state.agentConfirmed[agent.id] = true;
      state.maxUnlockedStep = index + 2;
      updateNavButtons();
      if (index + 1 < agents.length) {
        runAgent(index + 1);
      } else {
        buildReport();
        goToStep(10);
      }
    }, 200);
  }
}

// ========== Confirmation Logic ==========
function onConfirmCheck(agentIndex) {
  const agent = agents[agentIndex];
  const confirmItems = agent.confirmItems || [];
  let allChecked = true;
  for (let i = 0; i < confirmItems.length; i++) {
    const cb = document.querySelector(`#confirmItem_${agentIndex}_${i} input[type="checkbox"]`);
    if (cb && !cb.checked) allChecked = false;
  }
  const btn = document.getElementById('btnConfirm' + agentIndex);
  if (btn) btn.disabled = !allChecked;
}

function confirmAgent(index) {
  const agent = agents[index];
  state.agentConfirmed[agent.id] = true;
  state.maxUnlockedStep = index + 2;

  // Hide collaboration panel if open
  const collabPanel = document.getElementById('collabPanel' + index);
  if (collabPanel) collabPanel.style.display = 'none';

  // Update confirm gate to confirmed state
  const gate = document.getElementById('confirmGate' + index);
  if (gate) {
    gate.innerHTML = `
      <div class="confirm-gate-header confirmed">
        <h4>✅ 已确认通过</h4>
        <p>${agent.name}方案已获得园长/教研主任确认</p>
      </div>
      <div class="confirm-actions">
        <button class="btn btn-outline btn-sm" onclick="goToStep(${index})">📋 查看上一步</button>
        <button class="btn btn-primary btn-sm" onclick="runAgent(${index + 1})" style="margin-left:8px;">
          ${index + 1 < agents.length ? '进入下一步 →' : '查看报告 →'}
        </button>
      </div>
    `;
  }

  updateNavButtons();
}

// ========== Collaboration System ==========
function startCollaboration(index, mode) {
  state.collaborationMode = mode;
  const panel = document.getElementById('collabPanel' + index);
  const agent = agents[index];

  // Highlight selected mode button
  document.querySelectorAll(`[id^="collabBtn_${index}_"]`).forEach(b => b.classList.remove('active'));
  const activeBtn = document.getElementById('collabBtn_' + index + '_' + mode);
  if (activeBtn) activeBtn.classList.add('active');

  panel.style.display = 'block';

  if (mode === 'option') {
    showOptionPanel(index, panel, agent);
  } else if (mode === 'chat') {
    showChatPanel(index, panel, agent);
  } else if (mode === 'annotate') {
    showAnnotatePanel(index, panel, agent);
  }
}

// ========== Option Mode ==========
function showOptionPanel(index, panel, agent) {
  const data = state.formData;
  const fw = getFeatureWord(data);
  const rw = getResourceWord(data);
  const gw = getGoalWord(data);

  let options = [];
  if (index === 3) {
    // Agent 4: course naming options
    options = [
      { title: `"${fw}润童 · ${gw}成长"`, desc: '诗意典雅，突出特色与成长' },
      { title: `"${rw}童趣 · ${fw}童年"`, desc: '活泼生动，突出资源与童趣' },
      { title: `"${fw}启智 · 快乐成长"`, desc: '简洁明了，突出教育功能' }
    ];
  } else if (index === 4) {
    // Agent 5: philosophy style options
    options = [
      { title: '学术型表述', desc: '"以儿童发展为本，以生活经验为源，以游戏探究为径"' },
      { title: '诗意型表述', desc: '"让每一颗种子在阳光下自由生长"' },
      { title: '务实型表述', desc: '"在生活中学习，在游戏中成长，在探究中发展"' }
    ];
  } else if (index === 8) {
    // Agent 9: priority options
    options = [
      { title: '立即优化（高优先级）', desc: '明确与省编教材衔接、建立课程审议机制' },
      { title: '本学期优化（中优先级）', desc: '开发园本评价工具、建立课程资源库' },
      { title: '持续优化（低优先级）', desc: '形成可推广模式、积累课程建设成果' }
    ];
  } else {
    options = [
      { title: '方案A：按原方案执行', desc: '采纳AI专家的原始建议' },
      { title: '方案B：调整后执行', desc: '在AI方案基础上做微调' },
      { title: '方案C：重新生成', desc: '换一个方向重新设计方案' }
    ];
  }

  const optionsHtml = options.map((o, i) => `
    <div class="option-card" onclick="selectOption(${index}, ${i})" id="optionCard_${index}_${i}">
      <div class="option-card-title">${o.title}</div>
      <div class="option-card-desc">${o.desc}</div>
    </div>
  `).join('');

  panel.innerHTML = `
    <div class="collab-section option-section">
      <div class="collab-section-header">
        <span>🎯</span> 请选择您倾向的方案
      </div>
      <div class="option-cards">${optionsHtml}</div>
      <div class="option-custom">
        <input type="text" id="customOption${index}" placeholder="或输入您的自定义方案..." class="collab-input">
        <button class="btn btn-sm btn-outline" onclick="submitCustomOption(${index})">提交</button>
      </div>
    </div>
  `;
}

function selectOption(index, optionIndex) {
  document.querySelectorAll(`[id^="optionCard_${index}_"]`).forEach(c => c.classList.remove('selected'));
  const card = document.getElementById('optionCard_' + index + '_' + optionIndex);
  if (card) card.classList.add('selected');

  // Auto-confirm after selection
  setTimeout(() => {
    const gate = document.getElementById('confirmGate' + index);
    if (gate) {
      gate.querySelector('.collab-panel').style.display = 'none';
      gate.querySelector('.collab-divider').innerHTML = '<span>✅ 已选择方案，请确认后进入下一步</span>';
    }
  }, 500);
}

function submitCustomOption(index) {
  const input = document.getElementById('customOption' + index);
  const val = input.value.trim();
  if (!val) return;
  const panel = document.getElementById('collabPanel' + index);
  const feedback = document.createElement('div');
  feedback.className = 'collab-feedback';
  feedback.innerHTML = `<strong>✅ 已收到您的自定义方案：</strong>"${val}"<br>AI专家将基于此方案进行调整。`;
  panel.appendChild(feedback);
  input.value = '';
}

// ========== Chat Mode ==========
function showChatPanel(index, panel, agent) {
  if (!state.chatHistory[index]) state.chatHistory[index] = [];

  const messagesHtml = state.chatHistory[index].map(m => `
    <div class="chat-message ${m.role}">
      <div class="chat-avatar">${m.role === 'user' ? '👩‍🏫' : agent.icon}</div>
      <div class="chat-bubble">${m.content}</div>
    </div>
  `).join('');

  panel.innerHTML = `
    <div class="collab-section chat-section">
      <div class="collab-section-header">
        <span>💬</span> 与${agent.name}深度探讨
      </div>
      <div class="chat-messages" id="chatMessages${index}">
        ${messagesHtml || `<div class="chat-welcome">👋 您好！我是${agent.name}，请告诉我您对方案的疑问或修改意见，我们一起探讨。</div>`}
      </div>
      <div class="chat-input-area">
        <textarea id="chatInput${index}" rows="2" placeholder="输入您的疑问或修改意见..." class="collab-input" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendChatMessage(${index});}"></textarea>
        <button class="btn btn-sm btn-primary" onclick="sendChatMessage(${index})">发送</button>
      </div>
    </div>
  `;

  // Scroll to bottom
  const msgContainer = document.getElementById('chatMessages' + index);
  if (msgContainer) msgContainer.scrollTop = msgContainer.scrollHeight;
}

function sendChatMessage(index) {
  const input = document.getElementById('chatInput' + index);
  const msg = input.value.trim();
  if (!msg) return;

  if (!state.chatHistory[index]) state.chatHistory[index] = [];
  state.chatHistory[index].push({ role: 'user', content: msg });

  // Simulate AI response
  const agent = agents[index];
  const responses = [
    `感谢您的反馈！关于"${msg}"，我的建议是：基于园所实际情况，我们可以做以下调整...`,
    `理解您的顾虑。让我重新分析一下，从专业角度出发，我建议采用折中方案：保留核心框架，在细节上按您的意见修改。`,
    `这是一个很好的观点！结合您的意见，我更新了方案：在原有基础上增加了您提到的内容，使方案更贴合园所实际。`
  ];
  const response = responses[Math.floor(Math.random() * responses.length)];
  state.chatHistory[index].push({ role: 'agent', content: response });

  // Refresh chat panel
  const panel = document.getElementById('collabPanel' + index);
  showChatPanel(index, panel, agent);
}

// ========== Annotate Mode ==========
function showAnnotatePanel(index, panel, agent) {
  const output = state.agentResults[agent.id] || '';
  const lines = output.split('\n').slice(0, 15); // First 15 lines for annotation

  const annotateHtml = lines.map((line, i) => `
    <div class="annotate-line" id="annotateLine_${index}_${i}">
      <span class="annotate-text">${escapeHtml(line) || '&nbsp;'}</span>
      <button class="annotate-btn" onclick="toggleAnnotateInput(${index}, ${i})" title="在此处添加批注">💬</button>
      <div class="annotate-input-area" id="annotateInput_${index}_${i}" style="display:none;">
        <input type="text" class="collab-input" id="annotateText_${index}_${i}" placeholder="输入修改意见...">
        <button class="btn btn-sm btn-primary" onclick="submitAnnotation(${index}, ${i})">确认</button>
      </div>
    </div>
  `).join('');

  panel.innerHTML = `
    <div class="collab-section annotate-section">
      <div class="collab-section-header">
        <span>📝</span> 批注修改 · 点击 💬 按钮在具体内容上标注修改意见
      </div>
      <div class="annotate-lines">${annotateHtml}</div>
      <div class="annotate-summary" id="annotateSummary${index}"></div>
    </div>
  `;
}

function toggleAnnotateInput(index, lineIndex) {
  const inputArea = document.getElementById('annotateInput_' + index + '_' + lineIndex);
  if (inputArea) {
    inputArea.style.display = inputArea.style.display === 'none' ? 'flex' : 'none';
    if (inputArea.style.display === 'flex') {
      document.getElementById('annotateText_' + index + '_' + lineIndex).focus();
    }
  }
}

function submitAnnotation(index, lineIndex) {
  const input = document.getElementById('annotateText_' + index + '_' + lineIndex);
  const val = input.value.trim();
  if (!val) return;

  const summary = document.getElementById('annotateSummary' + index);
  const item = document.createElement('div');
  item.className = 'annotate-summary-item';
  item.innerHTML = `<strong>📝 批注 #${lineIndex + 1}：</strong>${escapeHtml(val)} <span style="color:var(--success)">✅ 已记录</span>`;
  summary.appendChild(item);

  // Hide input
  document.getElementById('annotateInput_' + index + '_' + lineIndex).style.display = 'none';
  input.value = '';

  // Update annotate button
  const line = document.getElementById('annotateLine_' + index + '_' + lineIndex);
  if (line) {
    line.querySelector('.annotate-btn').textContent = '✅';
    line.querySelector('.annotate-btn').style.color = 'var(--success)';
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ========== Build Report (Tabbed: Summary + Curriculum Doc) ==========
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

async function generateAndSavePlan() {
  var data = state.formData;
  var user = getCurrentUser();
  if (!user) { alert('请先登录'); return; }
  var fw = getFeatureWord(data);
  var rw = getResourceWord(data);
  var gw = getGoalWord(data);

  // Step 1: 用模板秒出框架
  var htmlContent = buildCurriculumDoc(data);

  // Step 2: 立即保存模板版本
  var planId;
  try {
    planId = await dbAdd('curriculum_plans', {
      kinderId: user.kinderId, name: data.name, fw: fw, rw: rw, gw: gw,
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

  // 演示版提示
  if (typeof isGuestUser === 'function' && isGuestUser()) {
    alert('演示方案已生成！可前往「我的园本课程」查看完整方案。');
  } else {
    alert('园本课程方案已生成！AI 正在后台优化方案，可前往「我的园本课程」查看。');
  }

  // Step 3: 后台异步调用 API 优化（演示版跳过，避免暴露 API Key）
  if (typeof isGuestUser !== 'function' || !isGuestUser()) {
    try {
      var systemPrompt = buildPlanSystemPrompt(data);
      var userPrompt = '请根据以上园所信息，生成一份完整的园本课程方案。';
      var result = await callAI(systemPrompt, userPrompt);

      if (result.success && result.content) {
        var aiHtml = result.content;
        var docMatch = aiHtml.match(/<div class="curriculum-doc"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/body>/i);
        if (!docMatch) {
          docMatch = aiHtml.match(/<div class="curriculum-doc"[^>]*>([\s\S]*?)<\/div>\s*$/i);
        }
        if (docMatch) {
          aiHtml = '<div class="curriculum-doc" style="max-width:100%;margin:0;">' + docMatch[1] + '</div>';
        }
        var existing = await dbGet('curriculum_plans', planId);
        await dbPut('curriculum_plans', {
          id: planId, kinderId: user.kinderId, name: data.name, fw: fw, rw: rw, gw: gw,
          formData: JSON.parse(JSON.stringify(data)),
          htmlContent: aiHtml,
          aiOptimized: true,
          createdAt: existing ? existing.createdAt : new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        console.log('AI 优化完成，方案已更新');
      } else {
        console.log('AI 优化失败，保留模板版本: ' + result.error);
      }
    } catch (e) {
      console.log('AI 优化异常: ' + e.message);
    }
  }

  if (typeof switchTab === 'function') {
    switchTab('my-courses');
  }
}

function buildSummaryContent(data) {
  const sections = [
    { id: 1, title: '📋 一、课程现状分析', icon: '🔍', color: '#4A9E8E' },
    { id: 2, title: '📜 二、政策研究解读', icon: '📜', color: '#F5A623' },
    { id: 3, title: '🏞️ 三、地域资源挖掘', icon: '🏞️', color: '#00B894' },
    { id: 4, title: '🎯 四、特色定位方案', icon: '🎯', color: '#6C5CE7' },
    { id: 5, title: '🏗️ 五、课程架构设计', icon: '🏗️', color: '#E17055' },
    { id: 6, title: '🗺️ 六、课程进阶地图', icon: '🗺️', color: '#0984E3' },
    { id: 7, title: '📐 七、课程实施方案', icon: '📐', color: '#FD79A8' },
    { id: 8, title: '📊 八、课程评价体系', icon: '📊', color: '#A29BFE' },
    { id: 9, title: '🏅 九、评审委员会报告', icon: '🏅', color: '#FDCB6E' },
  ];
  return sections.map(s => `
    <div class="report-section" style="border-left-color: ${s.color};">
      <h3><span style="color: ${s.color};">${s.icon}</span> ${s.title}</h3>
      <div class="report-content">${state.agentResults[s.id] || '待生成'}</div>
    </div>
  `).join('');
}

// ========== Theme Profile System ==========
// Each feature word maps to a unique "voice" - metaphors, angles, and content
// that make every kindergarten's curriculum feel custom-written.
function getThemeProfile(fw, rw, gw) {
  const profiles = {
    '运动': {
      icon: '🏃', coverIcon: '🏟️',
      courseName: `"活力童年 · ${gw || '健康'}成长"`,
      sectionTitles: {
        bg1: '从运动场出发：园所课程建设的现实起点',
        bg2: '在政策指引下找到自己的路',
        bg3: '支撑课程的五根理论支柱',
        ph1: '我们的运动教育信念',
        ph2: '课程主张：三句话定义我们是谁',
        ph3: '三层嵌套的课程圈层结构',
        go1: '总目标：培养"健康、创造"的完整儿童',
        go2: '五大领域目标与运动特色的深度融合',
        go3: '三年螺旋进阶：从感知到创造',
        ct1: '四大课程模块：运动特色的内容载体',
        ct2: '从鸟巢到运动场：地域资源的课程化转化',
        ct3: '学年主题规划：让课程有节奏地展开',
        im1: '环境创设：让每一寸空间都支持运动',
        im2: '一日生活流程：运动融入每个环节',
        im3: '四大教学策略：教师如何支持运动中的学习',
        im4: '家园社协同：构建运动教育共同体',
        ev1: '评价理念：看见成长而非评判差距',
        ev2: '四维评价体系总览',
        ev3: '表一：幼儿运动发展评价量表',
        ev4: '表二：教师运动课程实施能力评价量表',
        ev5: '表三：运动课程方案质量评审表',
        ev6: '表四：家园运动共育效果评价量表'
      },
      metaphor: {
        core: '起跑线', process: '赛道', growth: '冲刺', space: '运动场',
        child: '小小运动员', teacher: '教练', parent: '啦啦队'
      },
      background: (d) => `${d.name}的每一天，都是从运动开始的。清晨的阳光洒在${d.microEnv || '运动场'}上，孩子们奔跑、跳跃、攀爬的身影，构成了这所幼儿园最生动的画面。我们始终相信——身体是认知的第一工具，运动是童年最自然的语言。`,
      philosophy: (d) => [
        `把童年还给孩子，把身体还给童年——这是${d.name}课程设计的原点。`,
        `在${d.name}，我们不急于让孩子"学会什么"，而是先让他们"动起来"。因为运动带来的不仅是强健的体魄，更是专注力、抗挫力、合作力这些影响一生的品质。`,
        `我们理解的"运动"，远不止跑跑跳跳。它是孩子探索世界的方式——用身体丈量空间，用动作表达情绪，在追逐中理解规则，在合作中学会相处。`
      ],
      claim: (d) => [
        `在<span class="claim-highlight">奔跑</span>中发现自己`,
        `在<span class="claim-highlight">挑战</span>中超越自己`,
        `在<span class="claim-highlight">合作</span>中成为自己`
      ],
      domainMerge: [
        ['健康', '体能循环 · 动作发展 · 安全自护', '以运动场为基地，每日保证2小时户外体能活动'],
        ['语言', '运动故事创编 · 规则讨论 · 赛事播报', '在运动情境中自然产生表达需求，发展叙事与说明能力'],
        ['社会', '团队合作 · 规则意识 · 胜负观', '在团队运动中学习协商、轮流、接受输赢'],
        ['科学', '运动中的力学 · 身体测量 · 数据记录', '探究"怎样跑得更快""怎样跳得更高"，在运动中发展科学思维'],
        ['艺术', '身体律动 · 运动姿态绘画 · 奖牌设计', '感受运动之美，用多元方式表达运动体验']
      ],
      modules: [
        { icon: '🏃', name: '体能挑战模块', desc: '以走、跑、跳、爬、平衡、投掷等基本动作为核心，通过循环游戏、障碍挑战、体能闯关等形式，系统发展幼儿的力量、耐力、协调性和柔韧性。每周至少安排3次专项体能活动，每次30分钟以上。' },
        { icon: '⚽', name: '球类游戏模块', desc: '以足球、篮球、软式排球等球类运动为载体，重点培养幼儿的手眼协调、团队配合和规则意识。从自由玩球到简单比赛，循序渐进。每学期至少组织1次班级球类联赛。' },
        { icon: '🏅', name: '奥运文化模块', desc: '以鸟巢、水立方为真实教材，通过奥运故事、各国运动文化、体育精神等主题，培养幼儿的文化认同和拼搏精神。每学期安排1-2次"迷你奥运会"主题活动。' },
        { icon: '🔬', name: '运动科学模块', desc: '将运动与科学探究融合，引导幼儿探究"怎样跑得更快""为什么运动后会出汗""运动员吃什么"等问题，在运动中发展观察、提问、验证的科学思维。每主题至少设计1个运动科学小实验。' }
      ],
      ageThemes: (d) => [
        { age: '小班', sem1: '我爱运动 · 秋天的运动场 · 冬天不怕冷', sem2: '春天动起来 · 小动物运动会 · 夏天的水游戏', special: '趣味运动游戏、感官运动体验、亲子运动日' },
        { age: '中班', sem1: '运动小达人 · 丰收运动会 · 冰雪小勇士', sem2: '春天的赛道 · 昆虫运动会 · 水上小健将', special: '运动技能挑战、迷你赛事、运动日记' },
        { age: '大班', sem1: '我是运动员 · 秋季联赛 · 冬季训练营', sem2: '春季田径赛 · 动物奥林匹克 · 毕业运动会', special: '项目式运动探究、自主赛事策划、运动成果展' }
      ],
      dailySchedule: [
        ['8:00-9:00', '入园 · 晨间体能唤醒', '晨跑/律动操/运动器械自由探索'],
        ['9:00-10:00', '集体教学活动', '运动主题探究（如"怎样跳得更远"）'],
        ['10:00-11:00', '户外运动', '运动场分区活动（攀爬区/球类区/田径区/自由游戏区）'],
        ['11:00-12:00', '午餐', '运动营养小课堂（"运动员吃什么"）'],
        ['14:30-15:30', '区域游戏', '运动主题区角（运动科学角/奖牌设计坊/运动故事剧场）'],
        ['15:30-16:00', '回顾分享', '"今日运动之星"分享会'],
        ['16:00-17:00', '离园', '周末亲子运动任务卡']
      ],
      envDesc: (d) => `${d.name}的户外空间，就是一个为运动而生的乐园。${d.microEnv || '运动场'}被划分为体能挑战区、球类竞技区、自由探索区和休闲放松区四个功能区。攀爬架、平衡木、骑行道、小山坡——每一种地形都是孩子挑战自我的舞台。室内同样呼应运动主题：走廊变身"奥运文化长廊"，楼梯间记录着孩子们的"运动成长数据"，每个班级都设有"运动科学角"和"赛事播报站"。`,
      envLayout: [
        { zone: '体能挑战区', location: '运动场北侧', equipment: '攀爬架、平衡木、跳箱、单杠', focus: '力量、协调、勇气' },
        { zone: '球类竞技区', location: '运动场中央', equipment: '足球门、篮球架、投掷靶、球类收纳架', focus: '团队合作、规则意识、手眼协调' },
        { zone: '自由探索区', location: '运动场南侧', equipment: '小山坡、隧道、沙池、轮胎阵', focus: '创造力、冒险精神、自主游戏' },
        { zone: '休闲放松区', location: '运动场东侧', equipment: '草坪、小木屋、阅读角、饮水站', focus: '社交、休息、反思' }
      ],
      teachingStrategies: [
        { strategy: '情境激趣法', icon: '🎭', desc: '将运动技能练习融入故事化、角色化的游戏情境中，让幼儿在"玩角色"中自然习得运动技能。教师通过语言、道具、环境布置营造沉浸式情境，降低技能练习的枯燥感，提升幼儿参与的内在动机。', example: '中班"小青蛙跳荷叶"——将立定跳远融入故事情境，荷叶间距从30cm逐步增加到50cm，幼儿在"帮青蛙过河"的任务中自然练习跳跃。' },
        { strategy: '挑战进阶法', icon: '🏔️', desc: '为同一运动任务设置不同难度等级，让幼儿根据自身能力自主选择挑战级别。核心原则是"让每个孩子都能找到自己的最近发展区"，既保护自信心又推动发展。教师观察幼儿的选择，适时鼓励向上挑战。', example: '平衡木设"平地线（宽30cm）→低杆线（宽20cm，高10cm）→高杆线（宽15cm，高30cm）"三级，幼儿自选挑战，完成后可在"挑战记录墙"上贴星。' },
        { strategy: '赛事驱动法', icon: '🏆', desc: '定期举办班级、年级"迷你赛事"，将运动技能的学习成果在真实比赛情境中检验。赛事设计强调"人人参与、过程为重"，淡化竞技排名，强化规则意识、团队精神和胜负观的培养。', example: '大班"秋季田径赛"——设30米跑、立定跳远、投掷、接力四个项目，幼儿自主报名2项，分组比赛，自己计分，赛后举行颁奖仪式，每个孩子都获得"参赛证书"。' },
        { strategy: '探究融合法', icon: '🔬', desc: '将运动与科学探究有机结合，引导幼儿在运动中发现问题、提出假设、动手验证。发挥我园科学型教师的优势，将"喜欢探究"的教学风格融入运动课程，让运动不仅是身体的锻炼，更是思维的体操。', example: '"怎样跑得更快"探究项目——幼儿分组测试不同起跑姿势（站立式/蹲踞式）、不同摆臂幅度对速度的影响，用秒表计时，用图表记录，最后形成"跑步秘籍"海报。' }
      ],
      homeSchoolTable: [
        { level: '日常参与', activity: '亲子运动任务卡', frequency: '每周1次', detail: '如"和爸爸比赛跳绳""和妈妈一起晨跑"，拍照记录分享到班级群' },
        { level: '月度活动', activity: '亲子运动工作坊', frequency: '每月1次', detail: '家长与孩子共同体验一项运动项目，如亲子瑜伽、亲子足球、亲子定向越野' },
        { level: '学期展示', activity: '运动成长报告会', frequency: '每学期1次', detail: '用数据和视频展示幼儿体能发展曲线、运动故事集、成长里程碑' },
        { level: '家长资源', activity: '运动导师计划', frequency: '按需安排', detail: '邀请有运动专长的高知家长入园，开展"爸爸篮球课""妈妈瑜伽课"等' }
      ],
      evalRubric: {
        dimensions: [
          {
            dim: '体能发展',
            desc: '评估幼儿在走、跑、跳、爬、平衡、投掷等基本动作方面的发展水平',
            tools: '体能发展检核表（每月1次）',
            levels: [
              { level: '需支持 ★', desc: '基本动作需成人协助完成，如上下楼梯需扶扶手，跑步时易摔倒，不敢尝试攀爬设备' },
              { level: '发展中 ★★', desc: '能独立完成大部分基本动作，但协调性和耐力不足，如能跑但跑不远，能跳但落地不稳' },
              { level: '熟练 ★★★', desc: '动作协调流畅，能持续活动15分钟以上，能灵活运用多种动作方式，如跑跳结合、攀爬自如' },
              { level: '超越 ★★★★', desc: '动作技能突出，能创造性组合动作，如自创障碍赛道、设计新的跳跃方式，能带领同伴一起运动' }
            ]
          },
          {
            dim: '运动品质',
            desc: '评估幼儿在运动中的态度、坚持性和心理品质',
            tools: '运动品质观察记录（每周2-3次）',
            levels: [
              { level: '需支持 ★', desc: '面对稍有难度的运动任务容易退缩或哭闹，需要成人不断鼓励才愿意尝试，遇到失败后拒绝再次参与' },
              { level: '发展中 ★★', desc: '在成人鼓励下愿意尝试新运动，能坚持完成简单任务，但遇到连续失败时会沮丧，需要引导才能继续' },
              { level: '稳定 ★★★', desc: '主动挑战新运动项目，能坚持完成中等难度任务，失败后能自我调节情绪并再次尝试，有基本的安全意识' },
              { level: '突出 ★★★★', desc: '热爱运动挑战，面对困难表现出强烈的坚持性（如反复练习一个动作直到掌握），能鼓励同伴，主动关注运动安全' }
            ]
          },
          {
            dim: '团队合作',
            desc: '评估幼儿在团队运动中的合作能力、规则意识和社交表现',
            tools: '团队合作轶事记录（日常观察）',
            levels: [
              { level: '需支持 ★', desc: '以自我为中心，不愿分享运动器械，不理解轮流概念，在团队游戏中常与同伴发生冲突' },
              { level: '发展中 ★★', desc: '在成人引导下能轮流使用器械，知道基本规则但执行不稳定，愿意和熟悉的同伴一起运动' },
              { level: '稳定 ★★★', desc: '能自觉轮流等待，理解并遵守运动规则，能主动邀请同伴加入游戏，在团队中能协商简单分工' },
              { level: '突出 ★★★★', desc: '能组织同伴进行团队运动，主动协调冲突，能接受输赢并安慰失败的同伴，表现出领导力和公平意识' }
            ]
          },
          {
            dim: '运动认知',
            desc: '评估幼儿对运动原理的理解、运动策略的运用和运动计划的制定能力',
            tools: '运动探究记录表（每主题1次）',
            levels: [
              { level: '需支持 ★', desc: '对运动现象缺乏关注，不会描述自己的运动感受，不理解简单的运动规则' },
              { level: '发展中 ★★', desc: '能注意到运动中的简单现象（如"我跑快了会喘"），在引导下能说出1-2条运动规则，会模仿他人的运动方式' },
              { level: '稳定 ★★★', desc: '能主动发现运动中的规律（如"助跑可以跳得更远"），能解释运动规则，会制定简单的运动计划（如"我先练习三次再比赛"）' },
              { level: '突出 ★★★★', desc: '能提出运动探究问题（如"为什么摆臂能跑得更快"），能设计运动策略并验证效果，能教同伴运动技巧' }
            ]
          },
          {
            dim: '创意表达',
            desc: '评估幼儿在运动中的创造性表现和多元表达能力',
            tools: '运动作品档案袋（持续积累）',
            levels: [
              { level: '需支持 ★', desc: '运动方式单一，只会模仿他人的动作，缺乏自主的运动表达' },
              { level: '发展中 ★★', desc: '能在模仿基础上加入自己的小变化，愿意用绘画或语言简单描述自己的运动体验' },
              { level: '稳定 ★★★', desc: '能创造新的运动玩法或组合已有动作，能用多种方式（绘画、讲述、表演）表达运动体验，能设计简单的运动道具' },
              { level: '突出 ★★★★', desc: '能创编完整的运动游戏并带领同伴参与，能用丰富的艺术形式（故事、戏剧、设计图）表达运动创意，作品有鲜明的个人风格' }
            ]
          }
        ],
        periodDesc: (d) => `在${d.name}，评价不是学期末的一次"考试"，而是融入每一天的"看见"。我们采用"日常轶事记录→每周学习故事→每月发展检核→每学期成长报告"的四层评价节奏，让评价成为支持幼儿发展的工具，而非评判幼儿的标尺。`,
        usageGuide: (d) => `使用说明：①本评价表用于学期初摸底和学期末总结，教师根据日常观察进行评定；②每名幼儿在每个维度上选择一个最符合的发展层级，在对应格中打"√"；③"需支持"不是"差"，而是教师需要提供更多支持的信号；④评价结果用于制定个别化支持计划，不用于幼儿之间的横向比较；⑤建议结合具体轶事记录作为评定依据，避免主观印象。`
      },
      // 教师教学评价
      teacherEval: {
        intro: (d) => `课程的质量，最终取决于教师的专业水平。${d.name}的教师教学评价不是为了"考核"，而是为了"支持"——支持教师看见自己的成长，就像教师支持幼儿看见自己的成长一样。`,
        dimensions: [
          {
            dim: '运动课程理解力', desc: '对"活力童年"课程理念的认同与内化程度',
            levels: [
              { level: '需支持 ★', desc: '对课程理念停留在文字层面，实践中仍以传统教学模式为主，运动活动与课程理念脱节' },
              { level: '发展中 ★★', desc: '能说出课程核心理念，开始尝试将运动融入日常活动，但融合方式较为生硬' },
              { level: '稳定 ★★★', desc: '能将课程理念自然融入教学行为，运动活动设计体现"挑战、合作、探究"精神，能向家长解释课程理念' },
              { level: '突出 ★★★★', desc: '对课程理念有个人化的理解和创造性的实践，能引领年级组课程研讨，形成自己的教学风格' }
            ]
          },
          {
            dim: '运动活动设计力', desc: '设计运动主题活动与组织运动游戏的专业水平',
            levels: [
              { level: '需支持 ★', desc: '活动设计以教师示范为主，运动形式单一，缺乏情境性和趣味性，幼儿参与度低' },
              { level: '发展中 ★★', desc: '能设计基本的运动活动，开始加入情境元素，但活动层次不够分明，难以兼顾不同能力幼儿' },
              { level: '稳定 ★★★', desc: '能设计有情境、有层次的运动主题活动，能根据幼儿现场反应灵活调整，活动目标明确且可达成' },
              { level: '突出 ★★★★', desc: '能创编原创运动游戏，活动设计兼具趣味性和发展性，能整合多领域目标，形成可推广的活动方案' }
            ]
          },
          {
            dim: '运动观察与评价力', desc: '观察幼儿运动行为、记录分析与运用评价结果的能力',
            levels: [
              { level: '需支持 ★', desc: '观察缺乏重点，记录简单笼统（如"今天玩得很开心"），不会运用评价结果改进教学' },
              { level: '发展中 ★★', desc: '能关注到明显的运动行为，记录有具体事例但分析不够深入，开始尝试根据观察调整活动' },
              { level: '稳定 ★★★', desc: '能捕捉幼儿运动中的关键行为和发展信号，记录有细节有分析，能基于评价结果为幼儿提供个别化支持' },
              { level: '突出 ★★★★', desc: '能系统追踪幼儿运动发展轨迹，记录具有专业深度，能基于评价数据开展行动研究，引领团队提升评价能力' }
            ]
          },
          {
            dim: '运动安全与保护力', desc: '运动活动中的安全预判、保护措施和应急处理能力',
            levels: [
              { level: '需支持 ★', desc: '对运动安全隐患缺乏预判，保护措施不到位，遇到运动损伤时处理流程不清晰' },
              { level: '发展中 ★★', desc: '知道基本的安全检查流程，能进行常规保护，但对不同运动项目的风险点认识不足' },
              { level: '稳定 ★★★', desc: '能根据不同运动项目预判风险并做好防护，保护手法规范，能冷静处理常见运动损伤，定期检查器械安全' },
              { level: '突出 ★★★★', desc: '能将安全教育自然融入运动活动，培养幼儿自我保护意识，能制定班级运动安全预案，能培训其他教师安全保护技能' }
            ]
          }
        ],
        tools: '课程反思日志（每周1篇）+ 运动活动观摩评价（每月1次）+ 教师专业成长档案（每学期）',
        usage: '评价主体：教师自评 + 教研组长评价 + 园长评价。每学期末汇总三方评价，形成教师个人专业发展建议。'
      },
      // 课程方案评价
      curriculumEval: {
        intro: (d) => `课程方案本身也需要被评价。${d.name}的课程方案评价不是"写完了就放抽屉里"，而是在实践中不断被检验、被修正、被优化。`,
        dimensions: [
          {
            dim: '目标适宜性', desc: '课程目标是否符合幼儿年龄特点和发展需要',
            indicators: '目标是否体现年龄段差异？是否兼顾各领域均衡？是否既有挑战性又在最近发展区内？是否与园所特色方向一致？'
          },
          {
            dim: '内容丰富性', desc: '课程内容是否多元、有趣、与幼儿生活经验关联',
            indicators: '内容是否涵盖四大课程模块？是否充分利用地域资源？是否兼顾预设与生成？是否回应幼儿的兴趣和需求？'
          },
          {
            dim: '实施有效性', desc: '课程方案在实际执行中的可行性和效果',
            indicators: '一日流程是否顺畅？教师是否能按方案实施？幼儿参与度和投入度如何？特色活动是否达到预期效果？'
          },
          {
            dim: '资源利用率', desc: '园内外资源在课程中的整合与利用程度',
            indicators: '运动场功能分区是否有效运作？鸟巢/水立方/奥林匹克公园资源是否充分转化？家长资源是否有效整合？'
          },
          {
            dim: '特色彰显度', desc: '课程是否体现"活力童年"的独特教育气质',
            indicators: '运动特色是否贯穿各领域？课程主张是否在教学行为中体现？园所品牌辨识度是否提升？与其他幼儿园的课程是否有明显区分？'
          }
        ],
        tools: '课程审议表（每主题1次）+ 半日活动质量评估（每月1次）+ 学期课程质量自评报告',
        usage: '评价主体：课程领导小组（园长+教研主任+年级组长）。每学期末进行综合评审，形成《学期课程质量报告》，作为下学期课程修订的依据。'
      },
      // 家园共育评价
      homeEval: {
        intro: (d) => `家长是课程建设的重要伙伴，也是课程效果的见证者。${d.name}将家长满意度、参与度和教育观念转变纳入课程评价体系，让评价真正实现"多元主体参与"。`,
        dimensions: [
          {
            dim: '家长满意度', desc: '家长对课程整体质量和幼儿发展的满意程度',
            levels: [
              { level: '需改进 ★', desc: '家长对课程了解不足，满意度低于60%，有较多负面反馈或投诉' },
              { level: '合格 ★★', desc: '家长基本认可课程方向，满意度60%-80%，有少量建设性意见' },
              { level: '良好 ★★★', desc: '家长主动关注课程进展，满意度80%-95%，愿意向他人推荐园所课程' },
              { level: '优秀 ★★★★', desc: '家长高度认同课程理念，满意度95%以上，主动参与课程建设，成为课程"代言人"' }
            ]
          },
          {
            dim: '家长参与度', desc: '家长参与课程活动的频率、广度和深度',
            levels: [
              { level: '需改进 ★', desc: '家长参与率低于30%，参与形式单一（仅参加家长会），互动质量低' },
              { level: '合格 ★★', desc: '家长参与率30%-60%，能参加亲子工作坊等主要活动，开始有家长主动提供资源' },
              { level: '良好 ★★★', desc: '家长参与率60%-85%，多种形式参与（志愿者、助教、资源提供），家园互动频繁' },
              { level: '优秀 ★★★★', desc: '家长参与率85%以上，形成"家长导师团"等自组织，家园共育成为园所文化' }
            ]
          },
          {
            dim: '教育观念转变', desc: '家长在课程影响下教育观念和行为的变化',
            levels: [
              { level: '需改进 ★', desc: '家长仍以"学知识"为主要诉求，不理解运动课程的价值，家庭中缺乏运动氛围' },
              { level: '合格 ★★', desc: '家长开始理解运动对幼儿发展的意义，偶尔带孩子进行户外运动，但仍有"安全焦虑"' },
              { level: '良好 ★★★', desc: '家长认同"运动即学习"的理念，家庭中建立了运动习惯，能主动配合园所课程开展亲子运动' },
              { level: '优秀 ★★★★', desc: '家长成为运动教育理念的践行者和传播者，家庭运动文化浓厚，能影响其他家庭，形成社区运动氛围' }
            ]
          }
        ],
        tools: '家长满意度问卷（每学期1次）+ 家长参与记录表（持续）+ 家长访谈（每学期抽样）+ 亲子运动打卡数据',
        usage: '评价主体：家长自评 + 教师观察 + 园方统计。每学期末形成《家园共育评价报告》，识别需要特别关注的家庭，制定个别化家园沟通方案。'
      },
      evalNarrative: (d) => `在${d.name}，我们不给孩子贴"跑得快"或"跑得慢"的标签。我们的评价关注的不是运动成绩，而是每个孩子在自己的起点上，迈出了多大一步。也许今天他敢从平衡木上走过去了，也许她第一次主动邀请同伴一起踢球——这些，才是我们眼中的"成长"。`,
      safeguardNarrative: (d) => `运动课程的实施，需要勇气，更需要专业。${d.name}将运动安全放在首位，所有运动器械定期安检，教师均接受幼儿运动保护培训。同时，我们深知运动只是载体，育人才是目的——每学期的教研重点不是"设计了什么新游戏"，而是"孩子在运动中获得了什么成长"。`
    },
    '自然': {
      icon: '🌿', coverIcon: '🌳',
      courseName: `"自然润童 · ${gw || '成长'}四季"`,
      metaphor: { core: '种子', process: '生长', growth: '开花', space: '花园', child: '小园丁', teacher: '引路人', parent: '同行者' },
      background: (d) => `${d.name}的院子里，有一棵孩子们叫得出名字的树。春天他们看它发芽，夏天在它下面乘凉，秋天捡它的落叶做手工，冬天为它穿上"衣服"。这棵树，就是我们课程的原点——我们相信，大自然是最好的老师，而孩子天生就是自然的孩子。`,
      philosophy: (d) => [
        `在${d.name}，我们不说"教孩子认识自然"，而是说"带孩子回到自然"。因为认识是旁观，而回归是融入。`,
        `每一片叶子、每一只昆虫、每一场雨、每一阵风，都是课程。我们做的不是"设计"课程，而是"发现"课程——发现自然已经为我们准备好的教育契机。`,
        `我们相信慢的教育。就像种子发芽需要时间，孩子的成长也不需要催促。在自然中，他们自然会学会观察、学会等待、学会敬畏。`
      ],
      claim: (d) => [
        `在<span class="claim-highlight">自然</span>中发现`,
        `在<span class="claim-highlight">四季</span>中成长`,
        `在<span class="claim-highlight">土地</span>中扎根`
      ],
      domainMerge: [
        ['健康', '户外体能 · 自然食育 · 季节养生', '在大自然中自由奔跑，呼吸新鲜空气，品尝自己种植的蔬果'],
        ['语言', '自然日记 · 天气播报 · 自然诗歌', '在真实自然情境中激发表达欲望，记录观察发现'],
        ['社会', '照顾动植物 · 环保行动 · 合作种植', '在照料生命中学会责任，在环保行动中建立公民意识'],
        ['科学', '植物生长 · 昆虫观察 · 天气记录 · 生态探究', '以自然为实验室，发展观察、提问、验证的科学能力'],
        ['艺术', '自然物创作 · 大地艺术 · 自然摄影', '用自然材料进行艺术表达，感受自然之美']
      ],
      modules: [
        { icon: '🌱', name: '种植课程', desc: '播种育苗 · 观察记录 · 收获分享 · 食育体验' },
        { icon: '🦋', name: '自然探究', desc: '昆虫观察 · 天气记录 · 生态调查 · 自然实验' },
        { icon: '🍂', name: '四季美学', desc: '自然物创作 · 大地艺术 · 季节仪式 · 自然摄影' },
        { icon: '🌍', name: '生态行动', desc: '垃圾分类 · 节水节能 · 动植物保护 · 社区环保' }
      ],
      ageThemes: (d) => [
        { age: '小班', sem1: '幼儿园的树 · 秋天的落叶 · 冬天的小动物', sem2: '春天来了 · 小花小草 · 夏天的水', special: '自然散步、感官体验、自然物收集' },
        { age: '中班', sem1: '种子的旅行 · 丰收的季节 · 动物过冬', sem2: '春天的花园 · 昆虫世界 · 夏日果实', special: '种植体验、自然观察日记、户外野趣' },
        { age: '大班', sem1: '植物的秘密 · 秋天的收获 · 冬天的生态', sem2: '春天的变化 · 动物的一生 · 我要毕业了', special: '项目式自然探究、生态地图绘制、自然成果展' }
      ],
      dailySchedule: [
        ['8:00-9:00', '入园 · 自然角照料', '给植物浇水、观察记录、天气播报'],
        ['9:00-10:00', '集体教学活动', '自然主题探究（如"种子是怎么发芽的"）'],
        ['10:00-11:00', '户外自然探索', '花园/菜园活动、自然物收集、户外观察'],
        ['11:00-12:00', '午餐', '自然食育（"今天我们吃的菜从哪里来"）'],
        ['14:30-15:30', '区域游戏', '自然角/科学区/美工区（自然材料创作）'],
        ['15:30-16:00', '回顾分享', '自然发现分享会'],
        ['16:00-17:00', '离园', '周末亲子自然任务（如"找一片最美的落叶"）']
      ],
      envDesc: (d) => `${d.name}的户外空间，是一个微缩的自然世界。${d.microEnv || '种植园'}里，每个班级都有自己的"责任田"；小山坡上，野花野草自由生长；沙池和水池是孩子们最爱的"自然实验室"。室内同样充满自然气息：走廊是"四季长廊"，随季节变换展示；每个班级的自然角不只是摆设，而是孩子们每天照料、观察、记录的"研究基地"。`,
      envLayout: [
        { zone: '种植体验区', location: '户外南侧', equipment: '班级责任田、工具架、堆肥箱、雨水收集桶', focus: '生命教育、责任意识、观察记录' },
        { zone: '自然探索区', location: '小山坡及周边', equipment: '放大镜、捕虫网、标本盒、望远镜、测量工具', focus: '科学探究、好奇心、专注力' },
        { zone: '沙水游戏区', location: '户外中央', equipment: '沙池、水池、引水渠、挖掘工具、模具', focus: '感官体验、创造力、合作建构' },
        { zone: '生态观察站', location: '户外东侧', equipment: '昆虫旅馆、鸟屋、气象站、四季观察板', focus: '生态意识、长期观察、数据记录' }
      ],
      teachingStrategies: [
        { strategy: '自然笔记法', icon: '📓', desc: '引导幼儿用绘画、符号、照片等方式记录自然观察发现', example: '中班"我的种子日记"——从播种到发芽的持续观察记录' },
        { strategy: '五感体验法', icon: '👂', desc: '调动视觉、听觉、嗅觉、触觉、味觉全方位感知自然', example: '小班"秋天的声音"——闭眼聆听风吹树叶、踩落叶的声音' },
        { strategy: '项目探究法', icon: '🔍', desc: '围绕幼儿自发生成的自然问题，开展持续的项目式探究', example: '大班"蚂蚁王国"项目——从发现蚂蚁到搭建蚂蚁巢穴模型' },
        { strategy: '生态行动法', icon: '🌍', desc: '将自然认知转化为环保行动，培养生态责任感', example: '全园"垃圾分类小卫士"——分类、记录、宣传、评比' }
      ],
      homeSchoolTable: [
        { level: '日常参与', activity: '亲子自然任务', frequency: '每周1次', detail: '如"找一片最美的落叶""和爸爸妈妈观察月亮的变化"，拍照记录分享' },
        { level: '月度活动', activity: '亲子自然工作坊', frequency: '每月1次', detail: '亲子种植、自然物手工、户外野趣探险、自然摄影' },
        { level: '学期展示', activity: '自然成长分享会', frequency: '每学期1次', detail: '展示幼儿的自然笔记、种植成果、探究项目，家长参与互动' },
        { level: '家长资源', activity: '自然导师计划', frequency: '按需安排', detail: '邀请有园艺、生物、环保背景的家长入园分享专业知识' }
      ],
      evalRubric: {
        dimensions: [
          {
            dim: '自然观察力',
            desc: '评估幼儿使用多种感官观察自然现象、发现细节变化的能力',
            tools: '自然笔记分析（每周1次）',
            levels: [
              { level: '需支持 ★', desc: '对自然环境缺乏关注，需要成人反复引导才会注意明显的自然现象（如下雨、落叶），观察时间短暂' },
              { level: '发展中 ★★', desc: '在引导下能注意到明显的自然变化，能用1-2种感官进行观察（如看、摸），观察能持续3-5分钟' },
              { level: '敏锐 ★★★', desc: '能主动发现自然中的细节变化（如叶子上有虫卵、花瓣颜色渐变），能综合运用多种感官观察，能持续观察10分钟以上' },
              { level: '突出 ★★★★', desc: '能发现常人忽略的细微自然现象，能进行对比观察（如"这片叶子和那片不一样"），能自发进行长期跟踪观察（如每天记录同一株植物的变化）' }
            ]
          },
          {
            dim: '科学探究力',
            desc: '评估幼儿提出问题、设计探究、记录发现和分享交流的能力',
            tools: '探究过程记录表（每主题1次）',
            levels: [
              { level: '需支持 ★', desc: '很少主动提问，对探究活动缺乏兴趣，不会使用简单的探究工具（如放大镜），需要成人全程引导' },
              { level: '发展中 ★★', desc: '能提出简单问题（如"这是什么"），在示范下能使用1-2种探究工具，能用涂鸦或简单语言记录发现' },
              { level: '稳定 ★★★', desc: '能提出"为什么"类问题，能独立使用多种探究工具，能用符号、绘画、简单文字记录探究过程，愿意分享发现' },
              { level: '突出 ★★★★', desc: '能提出可探究的科学问题（如"为什么这边的植物长得更好"），能设计简单的对比实验，能系统记录并用多种方式展示探究成果' }
            ]
          },
          {
            dim: '生命关怀力',
            desc: '评估幼儿对动植物的照料行为和对生命的尊重态度',
            tools: '照料行为观察记录（日常）',
            levels: [
              { level: '需支持 ★', desc: '对动植物缺乏关注，偶尔出现不当行为（如扯叶子、踩蚂蚁），需要成人反复提醒' },
              { level: '发展中 ★★', desc: '在成人提醒下能轻拿轻放动植物，愿意参与浇水、喂食等简单照料活动，但需要成人监督' },
              { level: '稳定 ★★★', desc: '能主动记得照料任务（如每天给植物浇水），对待动植物温柔小心，能表达对生命的关心（如"小虫子也会疼"）' },
              { level: '突出 ★★★★', desc: '能自发照料动植物并持续负责，能关注动植物的需求（如"它好像渴了"），能影响同伴一起爱护生命，对生命现象有深刻的情感共鸣' }
            ]
          },
          {
            dim: '生态意识',
            desc: '评估幼儿对生态关系的理解和环保行动的参与',
            tools: '环保行为检核表（每月1次）',
            levels: [
              { level: '需支持 ★', desc: '不理解基本的环保概念，随手乱扔垃圾，浪费水电行为需要成人反复提醒' },
              { level: '发展中 ★★', desc: '知道垃圾要扔进垃圾桶，在提醒下能节约用水，能说出1-2个简单的环保行为' },
              { level: '稳定 ★★★', desc: '能自觉进行垃圾分类，主动节约水电，能说出简单的生态关系（如"小鸟吃虫子，虫子吃叶子"），能参与园内环保活动' },
              { level: '突出 ★★★★', desc: '能向他人宣传环保理念，能发现环境问题并提出改进建议，能持续参与环保行动并影响家庭和社区，理解人与自然的关系' }
            ]
          },
          {
            dim: '自然表达力',
            desc: '评估幼儿用多元方式表达自然体验和感受的能力',
            tools: '自然艺术作品档案袋（持续积累）',
            levels: [
              { level: '需支持 ★', desc: '很少主动表达自然体验，作品内容单一，缺乏个人特色' },
              { level: '发展中 ★★', desc: '能用1-2种方式表达自然体验（如画一朵花），作品有基本形态，开始加入自己的观察' },
              { level: '稳定 ★★★', desc: '能用多种方式表达（绘画、讲述、手工、表演），作品能体现个人观察和感受，有细节表现' },
              { level: '突出 ★★★★', desc: '能创造性地表达自然体验（如创编自然故事、设计自然艺术装置），作品有鲜明的个人风格和情感表达，能感染他人' }
            ]
          }
        ],
        periodDesc: (d) => `在${d.name}，评价就像观察一株植物的生长——我们不会每天去拔它看长了多少，而是定期记录、耐心等待、适时支持。我们采用"日常轶事记录→每周自然笔记→每月发展检核→每学期成长报告"的四层评价节奏。`,
        usageGuide: (d) => `使用说明：①本评价表用于学期初摸底和学期末总结，教师根据日常观察进行评定；②每名幼儿在每个维度上选择一个最符合的发展层级，在对应格中打"√"；③"需支持"不是"差"，而是教师需要提供更多支持的信号；④评价结果用于制定个别化支持计划，不用于幼儿之间的横向比较；⑤建议结合幼儿的自然笔记、探究记录、作品照片等作为评定依据。`
      },
      // 教师教学评价
      teacherEval: {
        intro: (d) => `课程的质量，最终取决于教师的专业水平。${d.name}的教师教学评价不是为了"考核"，而是为了"支持"——支持教师看见自己的成长，就像教师支持幼儿看见自己的成长一样。`,
        dimensions: [
          { dim: '自然课程理解力', desc: '对自然课程理念的认同与内化程度', levels: [{ level: '需支持 ★', desc: '对课程理念停留在文字层面，实践中仍以室内教学为主，自然活动流于形式' }, { level: '发展中 ★★', desc: '能说出课程核心理念，开始尝试带幼儿到户外活动，但自然探究深度不足' }, { level: '稳定 ★★★', desc: '能将自然教育理念自然融入日常，善于捕捉自然中的教育契机，能向家长传递自然教育价值' }, { level: '突出 ★★★★', desc: '对自然教育有个人化的理解和创造性的实践，能引领年级组自然课程研讨，形成自己的自然教育风格' }] },
          { dim: '自然活动设计力', desc: '设计自然主题探究活动与组织户外学习的专业水平', levels: [{ level: '需支持 ★', desc: '活动设计以讲解为主，户外活动缺乏探究性，对自然资源的利用停留在表面' }, { level: '发展中 ★★', desc: '能设计基本的自然观察活动，开始利用园内自然资源，但活动深度和持续性不足' }, { level: '稳定 ★★★', desc: '能设计有深度的自然探究项目，善于利用季节变化和偶发自然现象生成课程，活动有持续性' }, { level: '突出 ★★★★', desc: '能创编原创自然探究项目，善于整合社区自然资源，形成可推广的自然课程方案' }] },
          { dim: '自然观察与评价力', desc: '观察幼儿自然探究行为、记录分析与运用评价结果的能力', levels: [{ level: '需支持 ★', desc: '观察缺乏重点，记录简单笼统，不会运用评价结果改进自然课程' }, { level: '发展中 ★★', desc: '能关注到明显的自然探究行为，记录有具体事例但分析不够深入' }, { level: '稳定 ★★★', desc: '能捕捉幼儿自然探究中的关键发现，记录有细节有分析，能基于评价为幼儿提供个别化支持' }, { level: '突出 ★★★★', desc: '能系统追踪幼儿自然探究发展轨迹，能基于评价数据开展行动研究，引领团队提升自然课程质量' }] },
          { dim: '户外安全管理力', desc: '户外自然活动中的安全预判、风险管理和应急处理能力', levels: [{ level: '需支持 ★', desc: '对户外安全隐患缺乏预判，不敢带幼儿走出园门，遇到突发情况处理不当' }, { level: '发展中 ★★', desc: '知道基本的户外安全知识，能进行常规安全检查，但风险预判能力不足' }, { level: '稳定 ★★★', desc: '能根据不同自然环境预判风险并做好防护，能冷静处理户外突发情况，定期检查户外活动区域安全' }, { level: '突出 ★★★★', desc: '能将户外安全教育自然融入活动，培养幼儿风险识别能力，能制定户外活动安全预案，能培训其他教师户外安全技能' }] }
        ],
        tools: '课程反思日志（每周1篇）+ 自然活动观摩评价（每月1次）+ 教师专业成长档案（每学期）',
        usage: '评价主体：教师自评 + 教研组长评价 + 园长评价。每学期末汇总三方评价，形成教师个人专业发展建议。'
      },
      // 课程方案评价
      curriculumEval: {
        intro: (d) => `课程方案本身也需要被评价。${d.name}的课程方案评价不是"写完了就放抽屉里"，而是在实践中不断被检验、被修正、被优化。`,
        dimensions: [
          { dim: '目标适宜性', desc: '课程目标是否符合幼儿年龄特点和发展需要', indicators: '目标是否体现年龄段差异？是否兼顾各领域均衡？是否既有挑战性又在最近发展区内？是否与园所自然特色方向一致？' },
          { dim: '内容丰富性', desc: '课程内容是否多元、有趣、与幼儿生活经验关联', indicators: '内容是否涵盖四大课程模块？是否充分利用地域自然资源？是否兼顾预设与生成？是否回应幼儿对自然的兴趣和需求？' },
          { dim: '实施有效性', desc: '课程方案在实际执行中的可行性和效果', indicators: '一日流程是否顺畅？教师是否能按方案实施？幼儿在自然活动中的参与度和投入度如何？自然探究项目是否达到预期效果？' },
          { dim: '资源利用率', desc: '园内外自然资源在课程中的整合与利用程度', indicators: '种植园/自然角是否有效运作？周边自然资源是否充分转化？季节变化是否被有效利用？家长资源是否有效整合？' },
          { dim: '特色彰显度', desc: '课程是否体现"自然润童"的独特教育气质', indicators: '自然特色是否贯穿各领域？课程主张是否在教学行为中体现？园所品牌辨识度是否提升？与其他幼儿园的课程是否有明显区分？' }
        ],
        tools: '课程审议表（每主题1次）+ 半日活动质量评估（每月1次）+ 学期课程质量自评报告',
        usage: '评价主体：课程领导小组（园长+教研主任+年级组长）。每学期末进行综合评审，形成《学期课程质量报告》，作为下学期课程修订的依据。'
      },
      // 家园共育评价
      homeEval: {
        intro: (d) => `家长是课程建设的重要伙伴，也是课程效果的见证者。${d.name}将家长满意度、参与度和教育观念转变纳入课程评价体系，让评价真正实现"多元主体参与"。`,
        dimensions: [
          { dim: '家长满意度', desc: '家长对课程整体质量和幼儿发展的满意程度', levels: [{ level: '需改进 ★', desc: '家长对课程了解不足，满意度低于60%，有较多负面反馈' }, { level: '合格 ★★', desc: '家长基本认可课程方向，满意度60%-80%，有少量建设性意见' }, { level: '良好 ★★★', desc: '家长主动关注课程进展，满意度80%-95%，愿意向他人推荐园所课程' }, { level: '优秀 ★★★★', desc: '家长高度认同课程理念，满意度95%以上，主动参与课程建设，成为课程"代言人"' }] },
          { dim: '家长参与度', desc: '家长参与课程活动的频率、广度和深度', levels: [{ level: '需改进 ★', desc: '家长参与率低于30%，参与形式单一（仅参加家长会），互动质量低' }, { level: '合格 ★★', desc: '家长参与率30%-60%，能参加亲子自然工作坊等主要活动，开始有家长主动提供资源' }, { level: '良好 ★★★', desc: '家长参与率60%-85%，多种形式参与（志愿者、助教、资源提供），家园互动频繁' }, { level: '优秀 ★★★★', desc: '家长参与率85%以上，形成"家长导师团"等自组织，家园共育成为园所文化' }] },
          { dim: '教育观念转变', desc: '家长在课程影响下教育观念和行为的变化', levels: [{ level: '需改进 ★', desc: '家长仍以"学知识"为主要诉求，不理解自然课程的价值，家庭中缺乏户外活动习惯' }, { level: '合格 ★★', desc: '家长开始理解自然体验对幼儿发展的意义，偶尔带孩子进行户外活动，但仍有"怕脏怕累"的顾虑' }, { level: '良好 ★★★', desc: '家长认同"自然是最好老师"的理念，家庭中建立了户外活动习惯，能主动配合园所课程开展亲子自然探索' }, { level: '优秀 ★★★★', desc: '家长成为自然教育理念的践行者和传播者，家庭自然探索文化浓厚，能影响其他家庭，形成社区自然教育氛围' }] }
        ],
        tools: '家长满意度问卷（每学期1次）+ 家长参与记录表（持续）+ 家长访谈（每学期抽样）+ 亲子自然探索打卡数据',
        usage: '评价主体：家长自评 + 教师观察 + 园方统计。每学期末形成《家园共育评价报告》，识别需要特别关注的家庭，制定个别化家园沟通方案。'
      },
      evalNarrative: (d) => `在${d.name}，我们不用同一把尺子量所有孩子。有的孩子善于观察，能发现叶子上最小的虫卵；有的孩子善于照料，每天记得给植物浇水；有的孩子善于表达，能用一百种语言描述一朵花——每一种能力，都值得被看见。`,
      safeguardNarrative: (d) => `自然课程的挑战在于，它不能只在纸上设计。${d.name}的教师团队定期开展自然教育培训，学习识别常见动植物、掌握户外活动安全知识。我们与${d.nearbyResources || '周边社区'}建立合作，拓展孩子们的自然探索半径。`
    },
    '艺术': {
      icon: '🎨', coverIcon: '🎭',
      courseName: `"艺韵童心 · ${gw || '创造'}之美"`,
      metaphor: { core: '画笔', process: '创作', growth: '绽放', space: '画布', child: '小艺术家', teacher: '策展人', parent: '收藏家' },
      background: (d) => `${d.name}的每一面墙都会说话。走廊里挂着孩子们的涂鸦，楼梯转角展示着他们的手工作品，甚至连洗手间的镜子旁都贴着孩子们的"自画像"。我们相信，每个孩子都是天生的艺术家——他们需要的不是技巧的传授，而是表达的勇气和被看见的机会。`,
      philosophy: (d) => [
        `在${d.name}，艺术不是一门课，而是一种语言。当孩子还不会用文字表达时，他们已经在用线条、色彩、声音、动作来表达自己。`,
        `我们不教孩子"画得像"，我们保护他们"敢画"的勇气。因为艺术的价值不在于像不像，而在于是不是孩子内心真实的表达。`,
        `我们相信，艺术素养不是少数孩子的天赋，而是每个孩子与生俱来的权利。它关乎感知力、想象力、创造力——这些，比任何技能都更重要。`
      ],
      claim: (d) => [
        `用<span class="claim-highlight">色彩</span>表达情感`,
        `用<span class="claim-highlight">材料</span>创造世界`,
        `用<span class="claim-highlight">想象</span>超越现实`
      ],
      domainMerge: [
        ['健康', '精细动作 · 身体律动 · 情绪表达', '通过艺术活动发展手部精细动作，用身体律动释放情绪'],
        ['语言', '作品讲述 · 故事创编 · 戏剧表演', '在艺术创作后自然产生讲述需求，发展叙事能力'],
        ['社会', '合作创作 · 艺术分享 · 文化理解', '在集体创作中学习协商与合作，通过艺术理解多元文化'],
        ['科学', '材料探索 · 色彩实验 · 光影探究', '在艺术创作中探索材料的物理特性，发展科学思维'],
        ['艺术', '绘画手工 · 音乐律动 · 戏剧表演 · 艺术欣赏', '提供多元艺术体验，支持个性化艺术表达']
      ],
      modules: [
        { icon: '🎨', name: '视觉艺术', desc: '绘画涂鸦 · 手工制作 · 综合材料 · 艺术欣赏' },
        { icon: '🎵', name: '音乐律动', desc: '歌唱演奏 · 节奏游戏 · 音乐欣赏 · 身体律动' },
        { icon: '🎭', name: '戏剧表达', desc: '角色扮演 · 故事剧场 · 偶戏表演 · 创意戏剧' },
        { icon: '🏛️', name: '艺术行走', desc: '美术馆之旅 · 艺术家进园 · 社区艺术 · 亲子艺术' }
      ],
      ageThemes: (d) => [
        { age: '小班', sem1: '颜色宝宝 · 秋天的色彩 · 冬天的白', sem2: '春天的花 · 动物的花纹 · 夏天的彩虹', special: '涂鸦体验、感官材料探索、亲子艺术日' },
        { age: '中班', sem1: '线条的舞蹈 · 丰收的色彩 · 冬日的温暖', sem2: '春天的旋律 · 昆虫的艺术 · 夏日水彩', special: '材料实验、名画欣赏、班级艺术展' },
        { age: '大班', sem1: '我的艺术日记 · 秋天的诗 · 冬天的故事', sem2: '春天的创作 · 动物狂想曲 · 毕业艺术展', special: '项目式艺术创作、策展体验、艺术成果展' }
      ],
      dailySchedule: [
        ['8:00-9:00', '入园 · 自由涂鸦', '开放画架和材料，幼儿自由创作'],
        ['9:00-10:00', '集体教学活动', '艺术主题探究（如"颜色是怎么变出来的"）'],
        ['10:00-11:00', '户外活动', '大地艺术、自然材料创作、户外写生'],
        ['11:00-12:00', '午餐', '餐桌美学（摆盘、餐具搭配、进餐礼仪）'],
        ['14:30-15:30', '区域游戏', '美工区/音乐区/表演区/建构区'],
        ['15:30-16:00', '回顾分享', '"今日艺术家"作品分享会'],
        ['16:00-17:00', '离园', '亲子艺术任务（如"用家里的废旧材料做一件作品"）']
      ],
      envDesc: (d) => `${d.name}的环境本身，就是一件大型的艺术作品。${d.microEnv || '园内空间'}被设计成"可探索的美术馆"——走廊是流动的展览空间，转角是互动的艺术装置，墙面是孩子们自由涂鸦的画布。材料区分类陈列着纸张、布料、自然物、废旧材料等数百种创作素材，孩子们可以自由取用。`,
      evalRubric: {
        dimensions: [
          { dim: '艺术感知力', desc: '评估幼儿对色彩、线条、形状、声音、节奏等艺术元素的感知与辨识能力', tools: '艺术感知观察记录（每月1次）', levels: [
            { level: '需支持 ★', desc: '对艺术元素缺乏关注，颜色命名混乱，对音乐节奏无反应，需要成人反复引导才会注意明显的艺术刺激' },
            { level: '发展中 ★★', desc: '能辨识基本颜色和形状，对明显的音乐节奏变化有反应，在引导下能用1-2种感官感知艺术元素' },
            { level: '敏锐 ★★★', desc: '能敏锐辨识色彩的明暗、冷暖变化，能分辨不同乐器的音色，能主动关注环境中的艺术元素并表达感受' },
            { level: '突出 ★★★★', desc: '能发现细微的艺术变化（如"这幅画用了两种不同的蓝色"），能感知不同艺术风格的情感特征，有个人化的审美偏好并能解释原因' }
          ]},
          { dim: '艺术表现力', desc: '评估幼儿运用多种材料和媒介进行艺术创作与表达的能力', tools: '作品档案袋分析（持续积累）', levels: [
            { level: '需支持 ★', desc: '对艺术材料缺乏探索兴趣，创作内容单一重复，需要成人全程示范和协助' },
            { level: '发展中 ★★', desc: '愿意尝试2-3种艺术材料，能创作有基本形态的作品，在引导下能描述自己的作品' },
            { level: '稳定 ★★★', desc: '能主动选择和组合多种材料进行创作，作品有个人特色和细节表现，能讲述作品背后的故事或想法' },
            { level: '突出 ★★★★', desc: '能创造性地使用非常规材料，作品有鲜明的个人风格和情感表达，能进行系列创作（如"我的四季"系列画），作品能感染他人' }
          ]},
          { dim: '艺术想象力', desc: '评估幼儿在艺术活动中表现出的想象力和创造性思维', tools: '创意表现轶事记录（每周2-3次）', levels: [
            { level: '需支持 ★', desc: '思维固化，只会模仿教师示范或同伴作品，缺乏自主的想象和变化' },
            { level: '发展中 ★★', desc: '能在模仿基础上加入简单变化，在引导下能进行简单的联想（如"这个圆像太阳"）' },
            { level: '稳定 ★★★', desc: '能进行丰富的联想和想象（如"这个纸箱可以变成机器人"），能创造独特的艺术形象，作品有出人意料的想法' },
            { level: '突出 ★★★★', desc: '想象力极为丰富，能创造全新的艺术形象或故事情境，能进行"头脑风暴"式创意发散，能影响和激发同伴的想象' }
          ]},
          { dim: '艺术欣赏力', desc: '评估幼儿欣赏艺术作品、理解艺术文化和表达审美感受的能力', tools: '艺术欣赏对话记录（每主题1次）', levels: [
            { level: '需支持 ★', desc: '对艺术作品缺乏关注，不会主动观看或倾听，对艺术欣赏活动不感兴趣' },
            { level: '发展中 ★★', desc: '在引导下能观看艺术作品，能用简单语言描述"看到了什么"，能说出喜欢或不喜欢' },
            { level: '稳定 ★★★', desc: '能主动欣赏艺术作品，能描述作品的色彩、形状、内容等特征，能表达自己的感受和理由（如"我喜欢这幅画，因为它让我感觉很开心"）' },
            { level: '突出 ★★★★', desc: '能比较不同艺术作品的风格特点，能发现作品中的细节和隐喻，能表达深层次的审美感受（如"这幅画让我想起了春天的风"），能向他人介绍自己喜欢的艺术作品' }
          ]},
          { dim: '艺术合作力', desc: '评估幼儿在集体艺术创作中的合作、协商和分享能力', tools: '合作行为观察记录（日常观察）', levels: [
            { level: '需支持 ★', desc: '不愿分享材料，坚持独自创作，在集体创作中与其他幼儿发生冲突' },
            { level: '发展中 ★★', desc: '在成人引导下愿意分享材料，能和1-2个同伴一起创作，但合作较为浅层' },
            { level: '稳定 ★★★', desc: '能主动邀请同伴合作创作，能协商分工（如"你画天空，我画草地"），能接受同伴的建议，愿意分享自己的材料和想法' },
            { level: '突出 ★★★★', desc: '能组织集体艺术创作项目，善于协调不同意见，能欣赏和借鉴同伴的创意，在合作中展现领导力和包容心' }
          ]}
        ],
        periodDesc: (d) => `在${d.name}，我们不是用"像不像"来评价幼儿的艺术作品，而是用"有没有自己的表达"来衡量。我们采用"日常作品收集→每周创作故事→每月艺术观察→每学期艺术成长档案"的四层评价节奏。`,
        usageGuide: (d) => `使用说明：①本评价表用于学期初摸底和学期末总结，教师根据日常观察和作品收集进行评定；②每名幼儿在每个维度上选择一个最符合的发展层级，在对应格中打"√"；③"需支持"不是"差"，而是教师需要提供更多支持的信号；④评价结果用于制定个别化支持计划，不用于幼儿之间的横向比较；⑤建议结合幼儿的作品照片、创作过程视频、对话记录等作为评定依据。`
      },
      teacherEval: {
        intro: (d) => `课程的质量，最终取决于教师的专业水平。${d.name}的教师教学评价不是为了"考核"，而是为了"支持"——支持教师看见自己的成长，就像教师支持幼儿看见自己的成长一样。`,
        dimensions: [
          { dim: '艺术课程理解力', desc: '对"艺韵童心"课程理念的认同与内化程度', levels: [
            { level: '需支持 ★', desc: '对课程理念停留在文字层面，实践中仍以"教画法"为主，不重视幼儿的自由表达' },
            { level: '发展中 ★★', desc: '能说出课程核心理念，开始尝试减少示范、增加幼儿自主创作，但实践中仍有"像不像"的评价倾向' },
            { level: '稳定 ★★★', desc: '能将艺术教育理念自然融入日常，善于保护幼儿的创作勇气，能向家长解释"过程比结果重要"的价值' },
            { level: '突出 ★★★★', desc: '对艺术教育有个人化的理解和创造性的实践，能引领年级组艺术课程研讨，形成自己的艺术教育风格' }
          ]},
          { dim: '艺术活动设计力', desc: '设计多元艺术体验活动与支持幼儿艺术探究的专业水平', levels: [
            { level: '需支持 ★', desc: '活动设计以示范模仿为主，艺术材料单一，缺乏对幼儿艺术探索的支持' },
            { level: '发展中 ★★', desc: '能设计基本的艺术体验活动，开始提供多种材料，但活动深度和开放性不足' },
            { level: '稳定 ★★★', desc: '能设计开放性的艺术探究活动，善于提供丰富的材料和工具，能根据幼儿的兴趣和水平灵活调整活动' },
            { level: '突出 ★★★★', desc: '能创编原创艺术项目，善于整合多种艺术形式（视觉、音乐、戏剧），形成可推广的艺术课程方案' }
          ]},
          { dim: '艺术观察与评价力', desc: '观察幼儿艺术创作过程、解读幼儿作品与运用评价结果的能力', levels: [
            { level: '需支持 ★', desc: '评价停留在"画得好不好"层面，不会解读幼儿作品背后的想法，记录简单笼统' },
            { level: '发展中 ★★', desc: '开始关注幼儿的创作过程，能记录幼儿对作品的描述，但分析不够深入' },
            { level: '稳定 ★★★', desc: '能捕捉幼儿创作中的关键发现和成长变化，能通过对话了解幼儿的艺术意图，能基于评价为幼儿提供个别化支持' },
            { level: '突出 ★★★★', desc: '能系统追踪幼儿艺术发展轨迹，能基于评价数据开展行动研究，能通过作品解读与家长进行深度沟通' }
          ]},
          { dim: '艺术素养与示范力', desc: '教师自身的艺术素养和在教学中示范、引导的专业能力', levels: [
            { level: '需支持 ★', desc: '自身艺术素养薄弱，对艺术活动缺乏自信，不敢在幼儿面前进行艺术示范' },
            { level: '发展中 ★★', desc: '具备基本的艺术技能，能进行简单的示范，但艺术视野和审美素养有待提升' },
            { level: '稳定 ★★★', desc: '具备良好的艺术素养和审美能力，能进行恰当的艺术示范，能引入多元的艺术资源（名画、音乐、艺术家），能激发幼儿的艺术兴趣' },
            { level: '突出 ★★★★', desc: '艺术素养突出，有个人艺术特长，能将艺术素养自然融入日常教学，能带动团队提升艺术教育质量，能链接外部艺术资源' }
          ]}
        ],
        tools: '课程反思日志（每周1篇）+ 艺术活动观摩评价（每月1次）+ 教师专业成长档案（每学期）',
        usage: '评价主体：教师自评 + 教研组长评价 + 园长评价。每学期末汇总三方评价，形成教师个人专业发展建议。'
      },
      curriculumEval: {
        intro: (d) => `课程方案本身也需要被评价。${d.name}的课程方案评价不是"写完了就放抽屉里"，而是在实践中不断被检验、被修正、被优化。`,
        dimensions: [
          { dim: '目标适宜性', desc: '课程目标是否符合幼儿年龄特点和发展需要', indicators: '目标是否体现年龄段差异？是否兼顾各领域均衡？是否既有挑战性又在最近发展区内？是否与园所艺术特色方向一致？' },
          { dim: '内容丰富性', desc: '课程内容是否多元、有趣、与幼儿生活经验关联', indicators: '内容是否涵盖四大艺术课程模块？是否充分利用周边艺术资源？是否兼顾预设与生成？是否回应幼儿的艺术兴趣和需求？' },
          { dim: '实施有效性', desc: '课程方案在实际执行中的可行性和效果', indicators: '一日流程是否顺畅？教师是否能按方案实施？幼儿在艺术活动中的参与度和投入度如何？艺术项目是否达到预期效果？' },
          { dim: '资源利用率', desc: '园内外艺术资源在课程中的整合与利用程度', indicators: '美工区/音乐区/表演区是否有效运作？周边艺术资源是否充分转化？家长艺术资源是否有效整合？' },
          { dim: '特色彰显度', desc: '课程是否体现"艺韵童心"的独特教育气质', indicators: '艺术特色是否贯穿各领域？课程主张是否在教学行为中体现？园所品牌辨识度是否提升？与其他幼儿园的课程是否有明显区分？' }
        ],
        tools: '课程审议表（每主题1次）+ 半日活动质量评估（每月1次）+ 学期课程质量自评报告',
        usage: '评价主体：课程领导小组（园长+教研主任+年级组长）。每学期末进行综合评审，形成《学期课程质量报告》，作为下学期课程修订的依据。'
      },
      homeEval: {
        intro: (d) => `家长是课程建设的重要伙伴，也是课程效果的见证者。${d.name}将家长满意度、参与度和教育观念转变纳入课程评价体系，让评价真正实现"多元主体参与"。`,
        dimensions: [
          { dim: '家长满意度', desc: '家长对课程整体质量和幼儿发展的满意程度', levels: [
            { level: '需改进 ★', desc: '家长对课程了解不足，满意度低于60%，有较多负面反馈或认为"不教东西"' },
            { level: '合格 ★★', desc: '家长基本认可课程方向，满意度60%-80%，有少量建设性意见' },
            { level: '良好 ★★★', desc: '家长主动关注课程进展，满意度80%-95%，愿意向他人推荐园所课程' },
            { level: '优秀 ★★★★', desc: '家长高度认同课程理念，满意度95%以上，主动参与课程建设，成为课程"代言人"' }
          ]},
          { dim: '家长参与度', desc: '家长参与课程活动的频率、广度和深度', levels: [
            { level: '需改进 ★', desc: '家长参与率低于30%，参与形式单一（仅参加家长会），互动质量低' },
            { level: '合格 ★★', desc: '家长参与率30%-60%，能参加亲子艺术工作坊等主要活动，开始有家长主动提供资源' },
            { level: '良好 ★★★', desc: '家长参与率60%-85%，多种形式参与（志愿者、助教、资源提供），家园互动频繁' },
            { level: '优秀 ★★★★', desc: '家长参与率85%以上，形成"家长艺术导师团"等自组织，家园共育成为园所文化' }
          ]},
          { dim: '教育观念转变', desc: '家长在课程影响下教育观念和行为的变化', levels: [
            { level: '需改进 ★', desc: '家长仍以"画得像"为评价标准，不理解艺术表达的价值，家庭中缺乏艺术活动氛围' },
            { level: '合格 ★★', desc: '家长开始理解"过程比结果重要"，偶尔带孩子参与艺术活动，但仍有"画得不像"的焦虑' },
            { level: '良好 ★★★', desc: '家长认同"每个孩子都是艺术家"的理念，家庭中建立了艺术活动习惯，能主动配合园所课程开展亲子艺术创作' },
            { level: '优秀 ★★★★', desc: '家长成为艺术教育理念的践行者和传播者，家庭艺术氛围浓厚，能影响其他家庭，形成社区艺术教育氛围' }
          ]}
        ],
        tools: '家长满意度问卷（每学期1次）+ 家长参与记录表（持续）+ 家长访谈（每学期抽样）+ 亲子艺术创作打卡数据',
        usage: '评价主体：家长自评 + 教师观察 + 园方统计。每学期末形成《家园共育评价报告》，识别需要特别关注的家庭，制定个别化家园沟通方案。'
      },
      evalNarrative: (d) => `在${d.name}，我们不为孩子的作品打分。我们收集他们的每一张涂鸦、每一个手工作品，因为这些都是他们成长的印记。我们观察的不是"画得好不好"，而是"他今天用了新的颜色""她第一次尝试了不同的材料""他开始在作品中加入故事"——这些，才是真正的进步。`,
      safeguardNarrative: (d) => `艺术课程需要丰富的材料和专业的引导。${d.name}建立了艺术材料管理制度，确保所有材料安全无毒。教师团队定期参加艺术教育工作坊，提升自身的艺术素养和指导能力。我们与当地美术馆、艺术家工作室建立联系，为孩子们打开更广阔的艺术视野。`
    }
  };

  // Match profile or create generic one
  let profile = null;
  for (const [key, p] of Object.entries(profiles)) {
    if (fw.includes(key) || key.includes(fw)) { profile = p; break; }
  }
  if (!profile) {
    // Generic profile that still uses the theme words naturally
    profile = {
      icon: '📚', coverIcon: '🌟',
      courseName: `"${fw}润童 · ${gw}成长"`,
      metaphor: { core: fw, process: '探索', growth: '成长', space: '天地', child: '探索者', teacher: '引路人', parent: '同行者' },
      background: (d) => `${d.name}的每一个角落，都藏着教育的契机。${d.microEnv || '园内空间'}里，孩子们每天都在发生着属于他们的故事。我们相信，最好的课程不是从书本中来，而是从孩子们真实的生活和兴趣中来。`,
      philosophy: (d) => [
        `在${d.name}，我们始终追问一个问题：什么样的教育，才对得起孩子们的童年？`,
        `我们的答案是：让教育回归生活，让课程追随儿童。不是我们决定孩子学什么，而是我们从孩子身上发现他们需要什么。`,
        `"${fw}"不仅是一个特色标签，更是我们理解教育的方式——它代表着我们对儿童、对学习、对成长的基本信念。`
      ],
      claim: (d) => [
        `在<span class="claim-highlight">${rw}</span>中发现`,
        `在<span class="claim-highlight">游戏</span>中建构`,
        `在<span class="claim-highlight">生活</span>中成长`
      ],
      domainMerge: [
        ['健康', '身心协调发展', `在${fw}活动中促进身体发展和健康习惯养成`],
        ['语言', '倾听表达与阅读', `在${fw}探究中发展描述、记录、分享的语言能力`],
        ['社会', '人际交往与社会适应', `在${fw}合作中学会交往，建立归属感`],
        ['科学', '科学探究与数学认知', `在${rw}资源中发展观察、提问、验证的科学思维`],
        ['艺术', '感受欣赏与表现创造', `用${rw}资源进行多元艺术表达`]
      ],
      modules: [
        { icon: '🌟', name: `${fw}主题课程`, desc: `围绕${fw}特色设计的系列主题活动` },
        { icon: '🏠', name: '生活体验课程', desc: '自我服务 · 生活礼仪 · 安全教育 · 食育课程' },
        { icon: '🎮', name: '游戏探究课程', desc: '自主游戏 · 规则游戏 · 建构游戏 · 角色游戏' },
        { icon: '📋', name: '项目生成课程', desc: '主题探究 · 问题解决 · 成果展示 · 项目汇报' }
      ],
      ageThemes: (d) => [
        { age: '小班', sem1: '我上幼儿园 · 秋天的发现 · 冬天来了', sem2: '春天的颜色 · 可爱的小动物 · 夏天真有趣', special: `${fw}感官体验、亲子活动日` },
        { age: '中班', sem1: '我长大了 · 丰收的季节 · 寒冷的冬天', sem2: '春天的秘密 · 有趣的昆虫 · 快乐的夏天', special: `${fw}观察记录、实地探访` },
        { age: '大班', sem1: '我是大班小朋友 · 多彩的秋天 · 冬天的故事', sem2: '春天的变化 · 动物的奥秘 · 我要上小学了', special: `${fw}项目探究、成果展示` }
      ],
      dailySchedule: [
        ['8:00-9:00', '入园 · 晨间活动', `${fw}观察日记记录`],
        ['9:00-10:00', '集体教学活动', `${fw}主题探究活动`],
        ['10:00-11:00', '户外活动', `${fw}探索与游戏`],
        ['11:00-12:00', '午餐', '食育环节'],
        ['14:30-15:30', '区域游戏', `${fw}特色区域活动`],
        ['15:30-16:00', '回顾分享', `${fw}探究成果分享`],
        ['16:00-17:00', '离园', `${fw}亲子任务`]
      ],
      envDesc: (d) => `${d.name}的${d.microEnv || '园内空间'}围绕"${fw}"主题进行了整体规划。户外设置了探索区、运动区、创作区和交往区四个功能区域。室内环境随主题推进动态更新，区域材料结合${fw}特色投放，为幼儿提供丰富的操作和探究机会。`,
      evalRubric: {
        dimensions: [
          { dim: '学习品质', desc: '评估幼儿在活动中的好奇心、专注力、坚持性和主动性', tools: '学习品质观察记录（每周2-3次）', levels: [
            { level: '需支持 ★', desc: '对活动缺乏兴趣，容易分心，遇到困难立即放弃，需要成人不断督促才会参与活动' },
            { level: '发展中 ★★', desc: '在成人引导下能参与活动，能保持5-10分钟专注，遇到困难时在鼓励下愿意再尝试一次' },
            { level: '稳定 ★★★', desc: '主动参与活动，能保持15分钟以上专注，遇到困难能尝试不同方法解决，对感兴趣的事物有强烈的好奇心' },
            { level: '突出 ★★★★', desc: '对学习充满热情，能长时间专注于感兴趣的任务，面对挑战表现出极强的坚持性，能主动提出问题并寻求答案' }
          ]},
          { dim: `${fw}素养`, desc: `评估幼儿在${fw}特色活动中表现出的核心素养`, tools: '特色活动观察记录（每主题1次）', levels: [
            { level: '需支持 ★', desc: `对${fw}活动缺乏兴趣，参与度低，需要成人反复引导才会尝试${fw}相关活动` },
            { level: '发展中 ★★', desc: `在成人引导下愿意参与${fw}活动，能完成基本任务，开始表现出对${fw}的兴趣` },
            { level: '稳定 ★★★', desc: `主动参与${fw}活动，能独立完成任务，能运用${fw}相关技能解决问题，愿意分享自己的发现和体验` },
            { level: '突出 ★★★★', desc: `热爱${fw}活动，能创造性运用${fw}相关技能，能带领同伴一起参与，能将自己的${fw}经验迁移到新情境中` }
          ]},
          { dim: '社会性发展', desc: '评估幼儿在同伴交往、合作和情绪调节方面的能力', tools: '社会性发展轶事记录（日常观察）', levels: [
            { level: '需支持 ★', desc: '以自我为中心，不愿分享和轮流，与同伴冲突频繁，情绪表达方式不当（如打人、哭闹）' },
            { level: '发展中 ★★', desc: '在成人引导下能与同伴轮流和分享，开始学习用语言表达情绪，能与熟悉的同伴一起游戏' },
            { level: '稳定 ★★★', desc: '能主动与同伴合作，能协商解决简单冲突，能识别和表达自己的情绪，有2-3个稳定的玩伴' },
            { level: '突出 ★★★★', desc: '能组织同伴进行合作游戏，善于调解同伴冲突，能理解和关心他人的情绪，在群体中受欢迎' }
          ]},
          { dim: '语言与思维', desc: '评估幼儿在倾听、表达、阅读和思维发展方面的能力', tools: '语言发展观察记录（每月1次）', levels: [
            { level: '需支持 ★', desc: '表达意愿低，词汇量有限，听不懂简单指令，对阅读缺乏兴趣' },
            { level: '发展中 ★★', desc: '在成人鼓励下愿意表达，能用简单句子描述，能听懂并执行两步指令，喜欢听故事' },
            { level: '稳定 ★★★', desc: '能清晰表达自己的想法和需要，能讲述完整的事件，能提出"为什么"类问题，有良好的阅读习惯' },
            { level: '突出 ★★★★', desc: '表达流畅且有逻辑，能创编故事，能进行推理和预测，能将自己的想法用多种方式（语言、绘画、符号）表达' }
          ]},
          { dim: '创造力与审美', desc: '评估幼儿在艺术表达、创造性思维和审美感知方面的能力', tools: '作品档案袋分析（持续积累）', levels: [
            { level: '需支持 ★', desc: '创作内容单一，只会模仿，缺乏自主表达，对艺术活动兴趣低' },
            { level: '发展中 ★★', desc: '在成人引导下愿意尝试不同的创作方式，作品有简单变化，能说出自己喜欢什么' },
            { level: '稳定 ★★★', desc: '能主动运用多种材料和方式进行创作，作品有个人想法，能表达审美感受（如"这个颜色很好看"）' },
            { level: '突出 ★★★★', desc: '创作富有想象力和独创性，能创造性地使用材料，有鲜明的个人风格，能欣赏和评论他人的作品' }
          ]}
        ],
        periodDesc: (d) => `在${d.name}，评价不是为了给孩子贴标签，而是为了看见每个孩子独特的成长轨迹。我们采用"日常轶事记录→每周学习故事→每月发展检核→每学期成长报告"的四层评价节奏。`,
        usageGuide: (d) => `使用说明：①本评价表用于学期初摸底和学期末总结，教师根据日常观察进行评定；②每名幼儿在每个维度上选择一个最符合的发展层级，在对应格中打"√"；③"需支持"不是"差"，而是教师需要提供更多支持的信号；④评价结果用于制定个别化支持计划，不用于幼儿之间的横向比较；⑤建议结合具体轶事记录作为评定依据，避免主观印象。`
      },
      teacherEval: {
        intro: (d) => `课程的质量，最终取决于教师的专业水平。${d.name}的教师教学评价不是为了"考核"，而是为了"支持"——支持教师看见自己的成长，就像教师支持幼儿看见自己的成长一样。`,
        dimensions: [
          { dim: '课程理解力', desc: `对园本课程理念的认同与内化程度`, levels: [
            { level: '需支持 ★', desc: '对课程理念停留在文字层面，实践中仍以传统教学模式为主，活动与课程理念脱节' },
            { level: '发展中 ★★', desc: `能说出课程核心理念，开始尝试将${fw}特色融入日常活动，但融合方式较为生硬` },
            { level: '稳定 ★★★', desc: `能将课程理念自然融入教学行为，活动设计体现${fw}特色，能向家长解释课程理念` },
            { level: '突出 ★★★★', desc: '对课程理念有个人化的理解和创造性的实践，能引领年级组课程研讨，形成自己的教学风格' }
          ]},
          { dim: '活动设计力', desc: `设计${fw}主题探究活动与组织教学的专业水平`, levels: [
            { level: '需支持 ★', desc: `活动设计以讲解为主，缺乏探究性，对${rw}资源的利用停留在表面` },
            { level: '发展中 ★★', desc: `能设计基本的${fw}活动，开始利用园内资源，但活动深度和持续性不足` },
            { level: '稳定 ★★★', desc: `能设计有深度的${fw}探究项目，善于利用${rw}资源生成课程，活动有持续性` },
            { level: '突出 ★★★★', desc: `能创编原创${fw}课程方案，善于整合社区资源，形成可推广的课程方案` }
          ]},
          { dim: '观察与评价力', desc: '观察幼儿行为、记录分析与运用评价结果的能力', levels: [
            { level: '需支持 ★', desc: '观察缺乏重点，记录简单笼统，不会运用评价结果改进课程' },
            { level: '发展中 ★★', desc: '能关注到明显的幼儿行为，记录有具体事例但分析不够深入' },
            { level: '稳定 ★★★', desc: '能捕捉幼儿发展中的关键行为，记录有细节有分析，能基于评价为幼儿提供个别化支持' },
            { level: '突出 ★★★★', desc: '能系统追踪幼儿发展轨迹，能基于评价数据开展行动研究，引领团队提升课程质量' }
          ]},
          { dim: '家园沟通力', desc: '与家长沟通课程理念、反馈幼儿发展和引导家长参与的能力', levels: [
            { level: '需支持 ★', desc: '与家长沟通仅限于事务性通知，不敢或不愿与家长深入交流课程理念' },
            { level: '发展中 ★★', desc: '能向家长反馈幼儿基本表现，开始尝试传递课程理念，但沟通方式较为单一' },
            { level: '稳定 ★★★', desc: '能主动与家长分享幼儿成长故事，善于用具体事例说明课程价值，能引导家长参与课程活动' },
            { level: '突出 ★★★★', desc: '能策划并组织高质量的家园共育活动，善于处理家长的不同意见，能带动家长成为课程建设的合作伙伴' }
          ]}
        ],
        tools: '课程反思日志（每周1篇）+ 活动观摩评价（每月1次）+ 教师专业成长档案（每学期）',
        usage: '评价主体：教师自评 + 教研组长评价 + 园长评价。每学期末汇总三方评价，形成教师个人专业发展建议。'
      },
      curriculumEval: {
        intro: (d) => `课程方案本身也需要被评价。${d.name}的课程方案评价不是"写完了就放抽屉里"，而是在实践中不断被检验、被修正、被优化。`,
        dimensions: [
          { dim: '目标适宜性', desc: '课程目标是否符合幼儿年龄特点和发展需要', indicators: '目标是否体现年龄段差异？是否兼顾各领域均衡？是否既有挑战性又在最近发展区内？是否与园所特色方向一致？' },
          { dim: '内容丰富性', desc: '课程内容是否多元、有趣、与幼儿生活经验关联', indicators: `内容是否涵盖四大课程模块？是否充分利用${rw}资源？是否兼顾预设与生成？是否回应幼儿的兴趣和需求？` },
          { dim: '实施有效性', desc: '课程方案在实际执行中的可行性和效果', indicators: '一日流程是否顺畅？教师是否能按方案实施？幼儿参与度和投入度如何？特色活动是否达到预期效果？' },
          { dim: '资源利用率', desc: '园内外资源在课程中的整合与利用程度', indicators: `${rw}资源是否充分转化？园内功能区是否有效运作？家长资源是否有效整合？` },
          { dim: '特色彰显度', desc: `课程是否体现${fw}的独特教育气质`, indicators: `${fw}特色是否贯穿各领域？课程主张是否在教学行为中体现？园所品牌辨识度是否提升？与其他幼儿园的课程是否有明显区分？` }
        ],
        tools: '课程审议表（每主题1次）+ 半日活动质量评估（每月1次）+ 学期课程质量自评报告',
        usage: '评价主体：课程领导小组（园长+教研主任+年级组长）。每学期末进行综合评审，形成《学期课程质量报告》，作为下学期课程修订的依据。'
      },
      homeEval: {
        intro: (d) => `家长是课程建设的重要伙伴，也是课程效果的见证者。${d.name}将家长满意度、参与度和教育观念转变纳入课程评价体系，让评价真正实现"多元主体参与"。`,
        dimensions: [
          { dim: '家长满意度', desc: '家长对课程整体质量和幼儿发展的满意程度', levels: [
            { level: '需改进 ★', desc: '家长对课程了解不足，满意度低于60%，有较多负面反馈或投诉' },
            { level: '合格 ★★', desc: '家长基本认可课程方向，满意度60%-80%，有少量建设性意见' },
            { level: '良好 ★★★', desc: '家长主动关注课程进展，满意度80%-95%，愿意向他人推荐园所课程' },
            { level: '优秀 ★★★★', desc: '家长高度认同课程理念，满意度95%以上，主动参与课程建设，成为课程"代言人"' }
          ]},
          { dim: '家长参与度', desc: '家长参与课程活动的频率、广度和深度', levels: [
            { level: '需改进 ★', desc: '家长参与率低于30%，参与形式单一（仅参加家长会），互动质量低' },
            { level: '合格 ★★', desc: '家长参与率30%-60%，能参加亲子活动等主要活动，开始有家长主动提供资源' },
            { level: '良好 ★★★', desc: '家长参与率60%-85%，多种形式参与（志愿者、助教、资源提供），家园互动频繁' },
            { level: '优秀 ★★★★', desc: '家长参与率85%以上，形成"家长导师团"等自组织，家园共育成为园所文化' }
          ]},
          { dim: '教育观念转变', desc: '家长在课程影响下教育观念和行为的变化', levels: [
            { level: '需改进 ★', desc: `家长仍以"学知识"为主要诉求，不理解${fw}课程的价值，家庭中缺乏相关活动氛围` },
            { level: '合格 ★★', desc: `家长开始理解${fw}对幼儿发展的意义，偶尔带孩子进行相关活动，但仍有顾虑` },
            { level: '良好 ★★★', desc: `家长认同${fw}课程理念，家庭中建立了相关活动习惯，能主动配合园所课程开展亲子活动` },
            { level: '优秀 ★★★★', desc: `家长成为${fw}教育理念的践行者和传播者，家庭文化氛围浓厚，能影响其他家庭，形成社区教育氛围` }
          ]}
        ],
        tools: '家长满意度问卷（每学期1次）+ 家长参与记录表（持续）+ 家长访谈（每学期抽样）',
        usage: '评价主体：家长自评 + 教师观察 + 园方统计。每学期末形成《家园共育评价报告》，识别需要特别关注的家庭，制定个别化家园沟通方案。'
      },
      evalNarrative: (d) => `在${d.name}，我们相信评价的意义不在于比较，而在于看见——看见每个孩子独特的成长轨迹，看见他们在${fw}课程中的点滴进步。`,
      safeguardNarrative: (d) => `${d.name}将课程建设作为园所发展的核心工程，从组织、制度、师资、资源四个维度提供全面保障，确保${fw}课程理念真正落地。`
    };
  }
  return profile;
}

// ========== Build Curriculum Document (Dynamic) ==========
function buildCurriculumDoc(data) {
  const name = data.name || 'XX幼儿园';
  const fw = getFeatureWord(data);
  const rw = getResourceWord(data);
  const gw = getGoalWord(data);
  const features = data.features?.join('、') || '特色教育';
  const resources = data.resources?.join('、') || '周边资源';
  const goals = data.goals?.join('、') || '全面发展';
  const microEnv = data.microEnv?.join('、') || '园内环境';
  const nearby = data.nearbyResources?.join('、') || '社区资源';
  const teacher = data.teacher?.join('、') || '专业教师团队';
  const child = data.child?.join('、') || '活泼好动、乐于探索';
  const location = data.location || '所在地区';
  const plans = data.plans?.join('、') || '提升课程质量';
  const year = new Date().getFullYear();

  const p = getThemeProfile(fw, rw, gw);
  const m = p.metaphor;

  // Build philosophy paragraphs
  const philParagraphs = p.philosophy({ name, fw, rw, gw, features, resources, microEnv, nearby }).map(t => `<p>${t}</p>`).join('\n');

  // Build domain merge table
  const domainRows = p.domainMerge.map(dm => `
    <tr><td>${dm[0]}</td><td>${dm[1]}</td><td>${dm[2]}</td></tr>
  `).join('');

  // Build modules
  const modulesHtml = p.modules.map((m, mi) => `
    <div class="module-card">
      <div class="mc-icon c${mi + 1}">${m.icon}</div>
      <div class="mc-info">
        <div class="mc-title">${m.name}</div>
        <div class="mc-desc">${m.desc}</div>
      </div>
    </div>
  `).join('');

  // Build age themes
  const ageThemes = p.ageThemes({ name, fw, rw, gw });
  const ageThemeRows = ageThemes.map(a => `
    <tr><td>${a.age}</td><td>${a.sem1}</td><td>${a.sem2}</td><td>${a.special}</td></tr>
  `).join('');

  // Build daily schedule
  const scheduleRows = p.dailySchedule.map(s => `
    <tr><td>${s[0]}</td><td>${s[1]}</td><td>${s[2]}</td></tr>
  `).join('');

  // Build claim
  const claims = p.claim({ name, fw, rw, gw, resources });
  const claimsHtml = claims.map(c => `<div class="claim-line">${c}</div>`).join('\n');

  // Build resource table
  const resourceRows = [
    `<tr><td>核心资源</td><td>${resources}</td><td>主题探究、实地参访、资源地图绘制、项目学习</td></tr>`,
    `<tr><td>社区资源</td><td>${nearby}</td><td>社区探访、职业体验、社区服务、合作共建</td></tr>`,
    `<tr><td>园内资源</td><td>${microEnv}</td><td>日常活动、区域游戏、环境创设、特色活动</td></tr>`,
    `<tr><td>文化资源</td><td>地方文化、传统节日</td><td>文化体验日、节庆活动、传统游戏、故事传承</td></tr>`
  ].join('');

  const resourceMapHtml = [
    `<div class="resource-item"><div class="ri-icon r1">🏛️</div><div class="ri-info"><div class="ri-name">核心资源：${resources}</div><div class="ri-examples">主题探究 · 实地参访 · 资源地图绘制 · 项目学习</div></div></div>`,
    `<div class="resource-item"><div class="ri-icon r2">🏘️</div><div class="ri-info"><div class="ri-name">社区资源：${nearby}</div><div class="ri-examples">社区探访 · 职业体验 · 社区服务 · 合作共建</div></div></div>`,
    `<div class="resource-item"><div class="ri-icon r3">🏫</div><div class="ri-info"><div class="ri-name">园内资源：${microEnv}</div><div class="ri-examples">日常活动 · 区域游戏 · 环境创设 · 特色活动</div></div></div>`,
    `<div class="resource-item"><div class="ri-icon r4">📜</div><div class="ri-info"><div class="ri-name">文化资源：地方文化 · 传统节日</div><div class="ri-examples">文化体验日 · 节庆活动 · 传统游戏 · 故事传承</div></div></div>`
  ].join('');

  return `
<div class="curriculum-doc">
  <!-- 封面 -->
  <div class="doc-cover">
    <div class="doc-cover-icon">${p.coverIcon}</div>
    <h1 class="doc-title">${name}</h1>
    <h2 class="doc-subtitle">${p.courseName} 园本课程方案</h2>
    <div class="doc-cover-meta">
      <span>${location}</span>
      <span>·</span>
      <span>${year}年</span>
    </div>
  </div>

  <!-- 一、课程开发背景与理论基础 -->
  <div class="doc-section">
    <h3 class="doc-section-title"><span class="doc-num">一</span>课程开发背景与理论基础</h3>

    <h4 class="doc-subtitle2">${p.sectionTitles ? p.sectionTitles.bg1 : '开发背景'}</h4>
    <p>${p.background({ name, fw, rw, gw, features, resources, microEnv, nearby, location })}</p>
    <p>${name}坐落于${location}，现有${data.classCount || 'N'}个班级，${data.studentCount || 'N'}名幼儿。我们以"${features}"为特色方向，拥有${resources}等独特的地域资源。当前园所正处于从"有特色活动"走向"有课程体系"的关键阶段，需要一套既能落地生根、又能持续生长的园本课程方案。</p>

    <h4 class="doc-subtitle2">${p.sectionTitles ? p.sectionTitles.bg2 : '政策依据'}</h4>
    <p>本课程方案以《3-6岁儿童学习与发展指南》为根本遵循，落实"以游戏为基本活动"的核心要求，响应《幼儿园保育教育质量评估指南》对过程性质量和师幼互动质量的关注，同时对接${location}学前教育课程改革的具体部署。我们不是在政策框架里"填空"，而是在政策指引下，找到属于${name}自己的课程之路。</p>

    <h4 class="doc-subtitle2">${p.sectionTitles ? p.sectionTitles.bg3 : '理论基础'}</h4>
    <p>${name}的课程不是凭空而来。它扎根于我们对"儿童是如何学习的"这一根本问题的持续思考。杜威告诉我们，教育即生活——课程应该从孩子们真实的生活经验中生长出来。皮亚杰和维果茨基让我们明白，孩子是在与环境的互动中建构知识的，而教师的角色是在"最近发展区"里搭建支架。陈鹤琴先生的"活教育"思想——"大自然、大社会都是活教材"——更是直接启发了我们如何利用${rw}资源。瑞吉欧教育则提醒我们：孩子是有能力、有创造力的个体，环境是"第三位教师"。这些理论不是挂在墙上的标语，而是我们每天在做教育决策时的参照系。</p>
  </div>

  <!-- 二、课程理念与框架 -->
  <div class="doc-section">
    <h3 class="doc-section-title"><span class="doc-num">二</span>课程理念与框架</h3>

    <h4 class="doc-subtitle2">${p.sectionTitles ? p.sectionTitles.ph1 : '核心理念'}</h4>
    ${philParagraphs}

    <h4 class="doc-subtitle2">${p.sectionTitles ? p.sectionTitles.ph2 : '课程主张'}</h4>
    <div class="doc-claim">
      ${claimsHtml}
    </div>

    <h4 class="doc-subtitle2">${p.sectionTitles ? p.sectionTitles.ph3 : '课程框架'}</h4>
    <p>${name}的课程不是"基础+特色"的简单叠加，而是一个有机整体。我们将课程理解为三个相互嵌套的圈层：</p>
    <div class="framework-diagram">
      <div class="fw-outer">
        <div class="fw-title">生长课程</div>
        <div class="fw-pct">10%</div>
        <div class="fw-desc">生成性项目 · 偶发探究 · 兴趣小组</div>
      </div>
      <div class="fw-middle">
        <div class="fw-title">特色课程</div>
        <div class="fw-pct">30%</div>
        <div class="fw-desc">${fw}主题 · ${rw}资源 · 园所传统</div>
      </div>
      <div class="fw-inner">
        <div class="fw-title">根基课程</div>
        <div class="fw-pct">60%</div>
        <div class="fw-desc">五大领域 · 省编教材 · 一日生活</div>
      </div>
    </div>
    <p style="text-align:center;font-size:13px;color:var(--text-light);margin-top:8px;">三个圈层不是割裂的——根基中有特色，特色中有生长，生长又反哺根基。</p>
  </div>

  <!-- 三、课程目标 -->
  <div class="doc-section">
    <h3 class="doc-section-title"><span class="doc-num">三</span>课程目标</h3>

    <h4 class="doc-subtitle2">${p.sectionTitles ? p.sectionTitles.go1 : '总目标'}</h4>
    <p>${name}致力于培养<strong>${gw}的儿童</strong>——他们身体健康、喜欢运动，对世界充满好奇，敢于提问和尝试，能与同伴友好相处，会用多种方式表达自己的想法和感受，对自己、对他人、对周围的环境有初步的责任感。我们不是在培养"完美儿童"，而是在守护每个孩子成为"最好的自己"的可能性。</p>

    <h4 class="doc-subtitle2">${p.sectionTitles ? p.sectionTitles.go2 : '领域目标'}</h4>
    <table class="doc-table">
      <thead><tr><th>领域</th><th>核心发展目标</th><th>${fw}特色中的实现路径</th></tr></thead>
      <tbody>${domainRows}</tbody>
    </table>

    <h4 class="doc-subtitle2">${p.sectionTitles ? p.sectionTitles.go3 : '年龄段目标'}</h4>
    <p>同一个"${fw}"，不同年龄的孩子有不同的打开方式。这不是三个割裂的阶段，而是一个螺旋上升的连续体。</p>
    <div class="flow-diagram">
      <div class="flow-node">
        <div class="flow-icon">🌱</div>
        <div class="flow-title">小班 3-4岁</div>
        <div class="flow-desc"><strong>感知与体验</strong><br>用身体去感受<br>用感官去发现<br><em>教师：陪伴者</em></div>
      </div>
      <div class="flow-arrow">→</div>
      <div class="flow-node">
        <div class="flow-icon">🌿</div>
        <div class="flow-title">中班 4-5岁</div>
        <div class="flow-desc"><strong>探索与记录</strong><br>用工具去探究<br>用符号去表达<br><em>教师：支持者</em></div>
      </div>
      <div class="flow-arrow">→</div>
      <div class="flow-node">
        <div class="flow-icon">🌳</div>
        <div class="flow-title">大班 5-6岁</div>
        <div class="flow-desc"><strong>创造与反思</strong><br>用项目去整合<br>用成果去展示<br><em>教师：合作者</em></div>
      </div>
    </div>
    <table class="doc-table" style="margin-top:16px;">
      <thead><tr><th>年龄段</th><th>核心经验</th><th>典型表现</th><th>教师角色</th></tr></thead>
      <tbody>
        <tr><td>小班<br>(3-4岁)</td><td>感知与体验</td><td>对${fw}活动充满好奇，喜欢模仿和重复，在成人陪伴下愿意尝试</td><td><strong>陪伴者：</strong>创设安全环境，提供丰富感官刺激，用身体示范代替语言说教</td></tr>
        <tr><td>中班<br>(4-5岁)</td><td>探索与记录</td><td>能使用简单工具，愿意记录和分享发现，开始有自己的想法</td><td><strong>支持者：</strong>提供多样化工具和材料，用提问激发思考，支持幼儿的探究计划</td></tr>
        <tr><td>大班<br>(5-6岁)</td><td>创造与反思</td><td>能计划并执行小型项目，用多种方式表达成果，能与同伴合作解决问题</td><td><strong>合作者：</strong>与幼儿共同计划、共同探究、共同反思，推动深度学习</td></tr>
      </tbody>
    </table>
  </div>

  <!-- 四、课程内容 -->
  <div class="doc-section">
    <h3 class="doc-section-title"><span class="doc-num">四</span>课程内容</h3>

    <h4 class="doc-subtitle2">${p.sectionTitles ? p.sectionTitles.ct1 : '课程模块'}</h4>
    <div class="module-cards">${modulesHtml}</div>

    <h4 class="doc-subtitle2">${p.sectionTitles ? p.sectionTitles.ct2 : '资源利用'}</h4>
    <p>${name}周边蕴藏着丰富的教育资源。我们不是简单地"利用"这些资源，而是将它们转化为有教育意义的课程经验。</p>
    <div class="resource-map">${resourceMapHtml}</div>

    <h4 class="doc-subtitle2">${p.sectionTitles ? p.sectionTitles.ct3 : '主题规划'}</h4>
    <table class="doc-table">
      <thead><tr><th>年龄段</th><th>上学期主题</th><th>下学期主题</th><th>特色活动</th></tr></thead>
      <tbody>${ageThemeRows}</tbody>
    </table>
  </div>

  <!-- 五、课程实施 -->
  <div class="doc-section">
    <h3 class="doc-section-title"><span class="doc-num">五</span>课程实施</h3>

    <h4 class="doc-subtitle2">${p.sectionTitles ? p.sectionTitles.im1 : '环境创设'}</h4>
    <p>${p.envDesc({ name, fw, rw, gw, microEnv, nearby })}</p>
    ${p.envLayout ? `
    <div class="doc-env-layout">
      <h5 class="doc-mini-title">户外空间功能分区</h5>
      <table class="doc-table">
        <thead><tr><th>功能区</th><th>位置</th><th>设施配置</th><th>发展重点</th></tr></thead>
        <tbody>${p.envLayout.map(z => `<tr><td><strong>${z.zone}</strong></td><td>${z.location}</td><td>${z.equipment}</td><td>${z.focus}</td></tr>`).join('')}</tbody>
      </table>
    </div>` : ''}
    <p>比物理环境更重要的，是心理环境。在${name}，我们努力营造一种"允许犯错、鼓励尝试、尊重差异"的氛围。当孩子从平衡木上掉下来，我们不说"没关系"，而是说"你刚才走了三步，比昨天多了一步"；当孩子的作品和别人的不一样，我们不说"你应该这样画"，而是说"给我讲讲你的故事"。</p>

    <h4 class="doc-subtitle2">${p.sectionTitles ? p.sectionTitles.im2 : '一日生活流程'}</h4>
    <p>在${name}，我们不把"上课"和"生活"分开。入园时的晨间活动、进餐时的食育环节、户外时的自由探索、离园时的回顾分享——每一个时间段都蕴含着${fw}教育的契机。以下是我们的一日生活流程与${fw}特色渗透。</p>
    <table class="doc-table">
      <thead><tr><th>时间段</th><th>活动内容</th><th>${fw}特色渗透</th></tr></thead>
      <tbody>${scheduleRows}</tbody>
    </table>

    <h4 class="doc-subtitle2">${p.sectionTitles ? p.sectionTitles.im3 : '教学策略'}</h4>
    <p>好的课程需要好的实施。${name}的教师不是课程的"执行者"，而是课程的"共创者"。</p>
    ${p.teachingStrategies ? `
    <div class="strategy-cards">
      ${p.teachingStrategies.map(s => `
      <div class="strategy-card">
        <div class="sc-icon">${s.icon || '💡'}</div>
        <div class="sc-title">${s.strategy}</div>
        <div class="sc-desc">${s.desc}</div>
      </div>
      `).join('')}
    </div>
    <table class="doc-table" style="margin-top:12px;">
      <thead><tr><th>策略</th><th>核心要点</th><th>实践示例</th></tr></thead>
      <tbody>${p.teachingStrategies.map(s => `<tr><td><strong>${s.strategy}</strong></td><td>${s.desc}</td><td>${s.example}</td></tr>`).join('')}</tbody>
    </table>` : `
    <ul>
      <li><strong>观察先行：</strong>在行动之前，先观察——孩子对什么感兴趣？遇到了什么困难？和谁在一起？只有读懂了孩子，才能做出有意义的回应。</li>
      <li><strong>提问而非告知：</strong>当孩子遇到问题时，不急于给出答案，而是用"你觉得呢""还有什么办法""如果……会怎样"来推动他们自己思考。</li>
      <li><strong>记录让学习可见：</strong>用照片、视频、文字、幼儿作品等多种方式记录学习过程，让孩子的成长"被看见"，也让孩子自己"看见自己的成长"。</li>
      <li><strong>生成与预设的平衡：</strong>预设主题提供方向，生成活动赋予活力。教师有权根据班级实际情况调整30%以内的课程内容。</li>
    </ul>`}

    <h4 class="doc-subtitle2">${p.sectionTitles ? p.sectionTitles.im4 : '家园共育'}</h4>
    <p>${name}的课程不只在幼儿园里发生。我们视家长为最重要的教育伙伴，视社区为最丰富的课程资源。每月一次的亲子工作坊，不是"家长来看孩子表演"，而是家长和孩子一起体验${fw}的乐趣；每学期的家长沙龙，不是"老师给家长开会"，而是围绕孩子成长的真问题展开的真对话。针对我园${teacher}的教师特点和${child}的幼儿特点，我们特别设计了差异化的家园共育策略，确保每个家庭都能找到适合自己的参与方式。</p>
    ${p.homeSchoolTable ? `
    <div class="hs-ladder">
      ${p.homeSchoolTable.map((h, hi) => `
      <div class="hs-step">
        <div class="hs-level l${hi + 1}">${hi + 1}</div>
        <div class="hs-info">
          <div class="hs-title">${h.activity}</div>
          <div class="hs-desc">${h.detail}</div>
        </div>
        <div class="hs-freq">${h.frequency}</div>
      </div>
      `).join('')}
    </div>` : ''}
  </div>

  <!-- 六、课程评价 -->
  <div class="doc-section">
    <h3 class="doc-section-title"><span class="doc-num">六</span>课程评价</h3>

    <h4 class="doc-subtitle2">${p.sectionTitles ? p.sectionTitles.ev1 : '评价理念'}</h4>
    <p>${p.evalNarrative({ name, fw, rw, gw })}</p>

    <h4 class="doc-subtitle2">${p.sectionTitles ? p.sectionTitles.ev2 : '评价体系'}</h4>
    <p>${name}的课程评价是一个多主体、多维度的系统工程。我们围绕"谁来评、评什么、怎么评、评了怎么用"四个核心问题，构建了以下评价体系：</p>
    <div class="eval-overview">
      <div class="eval-overview-card">
        <div class="eval-ov-icon">👶</div>
        <div class="eval-ov-title">儿童发展评价</div>
        <div class="eval-ov-subject">评价主体：教师</div>
        <div class="eval-ov-content">5个维度 · 四级发展量表 · 日常嵌入</div>
      </div>
      <div class="eval-overview-card">
        <div class="eval-ov-icon">👩‍🏫</div>
        <div class="eval-ov-title">教师教学评价</div>
        <div class="eval-ov-subject">评价主体：教师自评 + 教研组长 + 园长</div>
        <div class="eval-ov-content">4个维度 · 四级发展量表 · 三方汇评</div>
      </div>
      <div class="eval-overview-card">
        <div class="eval-ov-icon">📋</div>
        <div class="eval-ov-title">课程方案评价</div>
        <div class="eval-ov-subject">评价主体：课程领导小组</div>
        <div class="eval-ov-content">5个维度 · 关键审视问题 · 学期评审</div>
      </div>
      <div class="eval-overview-card">
        <div class="eval-ov-icon">👨‍👩‍👧</div>
        <div class="eval-ov-title">家园共育评价</div>
        <div class="eval-ov-subject">评价主体：家长自评 + 教师观察 + 园方统计</div>
        <div class="eval-ov-content">3个维度 · 四级发展量表 · 学期报告</div>
      </div>
    </div>

    <h4 class="doc-subtitle2">${p.sectionTitles ? p.sectionTitles.ev3 : '儿童发展评价'}</h4>
    <p>${p.evalRubric ? p.evalRubric.periodDesc({ name, fw, rw, gw }) : `我们采用"观察-记录-分析-回应"的循环模式，在日常活动中自然嵌入评价。`}</p>
    ${p.evalRubric ? `
    <div class="eval-form-header">
      <div class="eval-form-row"><span class="ef-label">幼儿姓名：</span><span class="ef-blank">_______________</span><span class="ef-label">班级：</span><span class="ef-blank">_______________</span><span class="ef-label">评定日期：</span><span class="ef-blank">_______________</span></div>
    </div>
    <div class="eval-rubric-full">
      ${p.evalRubric.dimensions.map((d, di) => `
      <div class="eval-dimension">
        <div class="eval-dim-header">
          <span class="eval-dim-num">${di + 1}</span>
          <div class="eval-dim-info">
            <strong>${d.dim}</strong>
            <span class="eval-dim-desc">${d.desc}　|　${d.tools}</span>
          </div>
        </div>
        <table class="doc-table eval-fill-table">
          <thead><tr><th style="width:14%;">发展层级</th><th style="width:76%;">典型行为表现</th><th style="width:10%;">评定<br>(√选一项)</th></tr></thead>
          <tbody>
            ${d.levels.map(l => `<tr><td class="eval-level-name">${l.level}</td><td>${l.desc}</td><td class="eval-check-cell">☐</td></tr>`).join('')}
          </tbody>
        </table>
        <div class="eval-evidence">观察依据（简要记录）：_____________________________________________</div>
      </div>
      `).join('')}
    </div>
    <div class="eval-summary-table">
      <h5 class="doc-mini-title">学期评价汇总表</h5>
      <table class="doc-table">
        <thead><tr><th>幼儿姓名</th>${p.evalRubric.dimensions.map(d => `<th>${d.dim}</th>`).join('')}<th>综合评语</th></tr></thead>
        <tbody><tr><td>&nbsp;</td>${p.evalRubric.dimensions.map(() => '<td>&nbsp;</td>').join('')}<td>&nbsp;</td></tr></tbody>
      </table>
    </div>
    <div class="eval-usage-guide">
      <h5 class="doc-mini-title">使用说明</h5>
      <p>${p.evalRubric.usageGuide({ name, fw, rw, gw })}</p>
    </div>` : `
    <table class="doc-table">
      <thead><tr><th>评价工具</th><th>频率</th><th>用途</th><th>${fw}特色关注点</th></tr></thead>
      <tbody>
        <tr><td>学习故事</td><td>每周2-3篇</td><td>捕捉幼儿的"哇时刻"，记录成长亮点</td><td>重点关注幼儿在${fw}活动中的投入度、创造性和问题解决</td></tr>
        <tr><td>发展检核表</td><td>每月1次</td><td>系统追踪各领域发展情况</td><td>融入${fw}特色发展指标</td></tr>
        <tr><td>作品档案袋</td><td>持续积累</td><td>收集幼儿作品、照片、记录，形成成长轨迹</td><td>特别收录${fw}主题作品和探究记录</td></tr>
        <tr><td>学习品质观察</td><td>日常持续</td><td>关注好奇心、专注力、坚持性等学习品质</td><td>在${fw}活动中自然观察</td></tr>
      </tbody>
    </table>`}

    <h4 class="doc-subtitle2">${p.sectionTitles ? p.sectionTitles.ev4 : '教师教学评价'}</h4>
    ${p.teacherEval ? `
    <p>${p.teacherEval.intro({ name, fw, rw, gw })}</p>
    <div class="eval-form-header">
      <div class="eval-form-row"><span class="ef-label">教师姓名：</span><span class="ef-blank">_______________</span><span class="ef-label">任教班级：</span><span class="ef-blank">_______________</span><span class="ef-label">评定日期：</span><span class="ef-blank">_______________</span></div>
    </div>
    <div class="eval-rubric-full">
      ${p.teacherEval.dimensions.map((d, di) => `
      <div class="eval-dimension">
        <div class="eval-dim-header">
          <span class="eval-dim-num">${di + 1}</span>
          <div class="eval-dim-info">
            <strong>${d.dim}</strong>
            <span class="eval-dim-desc">${d.desc}</span>
          </div>
        </div>
        <table class="doc-table eval-fill-table">
          <thead><tr><th style="width:12%;">发展层级</th><th style="width:68%;">典型行为表现</th><th style="width:7%;">自评</th><th style="width:7%;">组长评</th><th style="width:6%;">园长评</th></tr></thead>
          <tbody>
            ${d.levels.map(l => `<tr><td class="eval-level-name">${l.level}</td><td>${l.desc}</td><td class="eval-check-cell">☐</td><td class="eval-check-cell">☐</td><td class="eval-check-cell">☐</td></tr>`).join('')}
          </tbody>
        </table>
      </div>
      `).join('')}
    </div>
    <div class="eval-summary-table">
      <h5 class="doc-mini-title">综合评价意见</h5>
      <table class="doc-table">
        <thead><tr><th>评价方</th><th>综合意见</th><th>签名</th></tr></thead>
        <tbody>
          <tr><td>教师自评</td><td>&nbsp;</td><td>&nbsp;</td></tr>
          <tr><td>教研组长</td><td>&nbsp;</td><td>&nbsp;</td></tr>
          <tr><td>园长</td><td>&nbsp;</td><td>&nbsp;</td></tr>
        </tbody>
      </table>
    </div>
    <div class="eval-usage-guide">
      <h5 class="doc-mini-title">评价工具与使用说明</h5>
      <p><strong>评价工具：</strong>${p.teacherEval.tools}</p>
      <p><strong>${p.teacherEval.usage}</strong></p>
    </div>` : `
    <p>课程的质量，最终取决于教师的专业水平。我们建立了"课程反思日志"制度（每周1篇），鼓励教师记录课程实施中的真实困惑和意外收获；每主题结束后进行"课程审议"，不是检查"有没有按计划做"，而是讨论"孩子从这个主题中获得了什么"；每学期末形成"教师专业成长档案"，让教师的成长也像孩子一样"被看见"。</p>`}

    <h4 class="doc-subtitle2">${p.sectionTitles ? p.sectionTitles.ev5 : '课程方案评价'}</h4>
    ${p.curriculumEval ? `
    <p>${p.curriculumEval.intro({ name, fw, rw, gw })}</p>
    <div class="eval-form-header">
      <div class="eval-form-row"><span class="ef-label">评审日期：</span><span class="ef-blank">_______________</span><span class="ef-label">评审学期：</span><span class="ef-blank">_______________</span></div>
    </div>
    <table class="doc-table eval-fill-table">
      <thead><tr><th style="width:14%;">评价维度</th><th style="width:46%;">关键审视问题</th><th style="width:8%;">评分<br>(1-5)</th><th style="width:32%;">具体证据/改进意见</th></tr></thead>
      <tbody>
        ${p.curriculumEval.dimensions.map(d => `<tr><td><strong>${d.dim}</strong><br><small>${d.desc}</small></td><td>${d.indicators}</td><td class="eval-check-cell">&nbsp;</td><td>&nbsp;</td></tr>`).join('')}
      </tbody>
      <tfoot><tr><td colspan="2" style="text-align:right;font-weight:700;">总分</td><td class="eval-check-cell" style="font-weight:700;">_____ / ${p.curriculumEval.dimensions.length * 5}</td><td>&nbsp;</td></tr></tfoot>
    </table>
    <div class="eval-summary-table">
      <h5 class="doc-mini-title">综合评审意见</h5>
      <table class="doc-table">
        <tbody>
          <tr><td style="width:20%;font-weight:700;">本学期课程亮点</td><td>&nbsp;</td></tr>
          <tr><td style="font-weight:700;">需要改进的问题</td><td>&nbsp;</td></tr>
          <tr><td style="font-weight:700;">下学期修订重点</td><td>&nbsp;</td></tr>
          <tr><td style="font-weight:700;">评审人签名</td><td>&nbsp;</td></tr>
        </tbody>
      </table>
    </div>
    <div class="eval-usage-guide">
      <h5 class="doc-mini-title">评分标准</h5>
      <p>${p.curriculumEval.scoringGuide || '1=严重不足　2=有待改进　3=基本达标　4=表现良好　5=表现突出　|　评价工具：' + p.curriculumEval.tools + '　|　评价主体：' + p.curriculumEval.usage}</p>
    </div>` : `
    <p>每学期末，课程领导小组将对课程方案本身进行审视：目标是否适宜？内容是否丰富？实施是否有效？评价结果不是用来"打分"的，而是用来"改进"的。我们相信，好的课程永远在"进行中"——它需要不断地被实践、被反思、被优化。</p>`}

    <h4 class="doc-subtitle2">${p.sectionTitles ? p.sectionTitles.ev6 : '家园共育评价'}</h4>
    ${p.homeEval ? `
    <p>${p.homeEval.intro({ name, fw, rw, gw })}</p>
    <div class="eval-form-header">
      <div class="eval-form-row"><span class="ef-label">班级：</span><span class="ef-blank">_______________</span><span class="ef-label">班级总人数：</span><span class="ef-blank">_______________</span><span class="ef-label">评定日期：</span><span class="ef-blank">_______________</span></div>
    </div>
    <div class="eval-rubric-full">
      ${p.homeEval.dimensions.map((d, di) => `
      <div class="eval-dimension">
        <div class="eval-dim-header">
          <span class="eval-dim-num">${di + 1}</span>
          <div class="eval-dim-info">
            <strong>${d.dim}</strong>
            <span class="eval-dim-desc">${d.desc}</span>
          </div>
        </div>
        <table class="doc-table eval-fill-table">
          <thead><tr><th style="width:12%;">发展层级</th><th style="width:68%;">典型表现</th><th style="width:10%;">人数</th><th style="width:10%;">占比</th></tr></thead>
          <tbody>
            ${d.levels.map(l => `<tr><td class="eval-level-name">${l.level}</td><td>${l.desc}</td><td class="eval-check-cell">&nbsp;</td><td class="eval-check-cell">&nbsp;</td></tr>`).join('')}
          </tbody>
        </table>
      </div>
      `).join('')}
    </div>
    <div class="eval-summary-table">
      <h5 class="doc-mini-title">班级整体评价与改进措施</h5>
      <table class="doc-table">
        <tbody>
          <tr><td style="width:20%;font-weight:700;">班级整体层级</td><td>&nbsp;</td></tr>
          <tr><td style="font-weight:700;">需要重点关注的家庭</td><td>&nbsp;</td></tr>
          <tr><td style="font-weight:700;">跟进措施</td><td>&nbsp;</td></tr>
          <tr><td style="font-weight:700;">教师签名</td><td>&nbsp;</td></tr>
        </tbody>
      </table>
    </div>
    <div class="eval-usage-guide">
      <h5 class="doc-mini-title">评价工具与主体</h5>
      <p><strong>评价工具：</strong>${p.homeEval.tools}　|　<strong>评价主体：</strong>${p.homeEval.usage}</p>
    </div>` : ''}
  </div>

  <!-- 七、课程保障 -->
  <div class="doc-section">
    <h3 class="doc-section-title"><span class="doc-num">七</span>课程保障</h3>

    <h4 class="doc-subtitle2">组织与制度</h4>
    <p>${name}成立以园长为组长的课程领导小组，保教主任、教研组长和骨干教师为核心成员。课程不是园长一个人的事，也不是教研主任一个人的事——它是整个团队共同的事业。我们建立了"三审三议"制度：学期初审议课程计划，学期中审议实施情况，学期末审议课程效果。每一次审议都不是走过场，而是基于真实问题和证据的专业对话。</p>

    <h4 class="doc-subtitle2">教师专业发展</h4>
    <p>${p.safeguardNarrative({ name, fw, rw, gw, teacher, nearby })}</p>
    <p>具体措施包括：每学期至少2次园本课程专题培训；建立"师徒结对"机制，骨干教师带教新教师；鼓励教师参加各级课程评比和论文评选；每学期选派教师外出学习交流。我们特别珍视${teacher}的教师特点，将其视为课程建设的宝贵资源而非需要"纠正"的问题。</p>

    <h4 class="doc-subtitle2">资源与经费</h4>
    <p>每年预算中安排专项课程建设经费，用于材料采购、教师培训和课程资源开发。建立${fw}课程材料清单，定期补充和更新。与${nearby}等建立长期合作关系，确保社区资源的稳定利用。我们相信，对课程的投入，就是对每一个孩子未来的投入。</p>
  </div>

  <!-- 落款 -->
  <div class="doc-footer">
    <p>${name}</p>
    <p>${year}年</p>
  </div>
</div>`;
}

function copyReport() {
  let text = state.formData.name + '园本课程建设报告\n' + '='.repeat(30) + '\n\n';
  for (let i = 1; i <= 9; i++) {
    if (state.agentResults[i]) {
      text += state.agentResults[i] + '\n\n' + '='.repeat(30) + '\n\n';
    }
  }
  navigator.clipboard.writeText(text).then(() => {
    alert('报告已复制到剪贴板');
  }).catch(() => {
    alert('复制失败，请手动选择文本');
  });
}

function resetApp() {
  state.currentStep = 0;
  state.maxUnlockedStep = 0;
  state.formData = {};
  state.agentResults = {};
  state.isGenerating = false;
  state.agentConfirmed = {};
  state.currentAgentIndex = -1;
  state.collaborationMode = null;
  state.chatHistory = {};
  for (let i = 1; i <= 10; i++) {
    document.getElementById('step' + i).innerHTML = '';
  }
  document.getElementById('formProgress').style.width = '0%';
  updateNavButtons();
  renderStep();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

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

// ========== Tab Navigation (app.html) ==========
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

function toggleUserMenu() {
  const menu = document.getElementById('userMenu');
  menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}

document.addEventListener('click', function(e) {
  if (!e.target.closest('.nav-dropdown')) {
    const menu = document.getElementById('userMenu');
    if (menu) menu.style.display = 'none';
  }
});

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
          <button class="btn btn-sm btn-accent" onclick="showUploadRecord(${plan.id})">+ 上传记录</button>
        </div>
        <div class="mc-records-grid" id="mcRecordsGrid">${renderRecords(records)}</div>
      </div>
    </div>
  `;
}

function renderRecords(records) {
  if (records.length === 0) return '<p style="color:#999;text-align:center;padding:20px;">暂无记录</p>';
  return records.map(r => '<div class="mc-record-card">' +
    (r.fileData && r.fileType && r.fileType.startsWith('image/') ? '<img src="' + r.fileData + '" class="mc-record-thumb" onclick="previewRecord(' + r.id + ')">' : '') +
    (r.fileData && r.fileType && r.fileType.startsWith('video/') ? '<video src="' + r.fileData + '" class="mc-record-thumb" onclick="previewRecord(' + r.id + ')" style="cursor:pointer;"></video>' : '') +
    (r.fileName && !r.fileType.startsWith('image/') && !r.fileType.startsWith('video/') ? '<div class="mc-record-file">📄 ' + r.fileName + '</div>' : '') +
    '<div class="mc-record-title">' + (r.title || '未命名') + '</div>' +
    (r.tags ? '<div class="mc-record-tags">' + r.tags.split(',').map(function(t) { return '<span class="mc-tag">' + t.trim() + '</span>'; }).join('') + '</div>' : '') +
    (r.notes ? '<div class="mc-record-notes">' + r.notes + '</div>' : '') +
    '<div class="mc-record-meta"><span>' + (r.createdBy || '') + '</span><span>' + new Date(r.createdAt).toLocaleDateString() + '</span></div>' +
    '<button class="btn btn-sm btn-danger" onclick="deleteRecord(' + r.id + ')">删除</button>' +
    '</div>'
  ).join('');
}

// ========== 方案操作 ==========
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
  overlay.innerHTML = `<div class="modal-card" style="width:1660px;max-width:95vw;"><h3>${c.type === 'weekly_plan' ? '📅 周教学计划' : '📦 主题资源包'}</h3><div style="max-height:70vh;overflow-y:auto;">${c.htmlContent}</div><div class="modal-actions"><button class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">关闭</button></div></div>`;
  document.body.appendChild(overlay);
}

async function deleteContent(id) {
  if (!confirm('确定删除该课程内容？')) return;
  await dbDelete('course_contents', id);
  if (selectedPlanId) selectPlan(selectedPlanId);
}

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
  if (type === 'weekly_plan') { content = generateWeeklyPlan(plan, ageGroup, theme, week); }
  else { content = generateResourcePack(plan, ageGroup, theme); }
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

  // 异步调用 AI 优化
  var genContainerId = 'genResultContainer_' + Date.now();
  var resultCard = resultEl.querySelector('.gen-result-card');
  if (resultCard) {
    resultCard.id = genContainerId;
  }

  showAIStatus(genContainerId, 'loading', 'AI 正在优化内容，请稍候...');

  (function() {
    var capturedPlan = plan;
    var capturedType = type;
    var capturedAgeGroup = ageGroup;
    var capturedTheme = theme;
    var capturedWeek = week;
    var capturedContainerId = genContainerId;

    async function doAIOptimize() {
      try {
        var systemPrompt = buildContentSystemPrompt(capturedPlan, capturedType, capturedAgeGroup, capturedTheme);
        var userPrompt = capturedType === 'weekly_plan'
          ? '请生成' + capturedAgeGroup + '的"' + capturedTheme + '"周教学计划（第' + capturedWeek + '周），以 HTML 表格格式输出。'
          : '请生成' + capturedAgeGroup + '的"' + capturedTheme + '"主题资源包，以 HTML 格式输出。';

        var result = await callAI(systemPrompt, userPrompt);

        if (result.success && result.content) {
          var aiHtml = result.content;
          var tableMatch = aiHtml.match(/<table[\s\S]*?<\/table>/i);
          var previewEl = document.getElementById(capturedContainerId);
          if (previewEl && tableMatch) {
            var contentPreview = previewEl.querySelector('.gen-content-preview');
            if (contentPreview) {
              contentPreview.innerHTML = tableMatch[0];
              var badge = document.createElement('span');
              badge.style.cssText = 'display:inline-block;background:#e8f5e9;color:#2e7d32;padding:2px 8px;border-radius:4px;font-size:11px;margin-left:8px;';
              badge.textContent = 'AI 优化版';
              badge.className = 'ai-badge';
              var h4 = previewEl.querySelector('h4');
              if (h4 && !h4.querySelector('.ai-badge')) { h4.appendChild(badge); }
              showAIStatus(capturedContainerId, 'success', 'AI 优化完成');
            }
          }
        } else {
          showAIStatus(capturedContainerId, 'error', 'AI 服务暂时不可用，当前为模板版本', function() {
            doGenerate();
          });
        }
      } catch (e) {
        showAIStatus(capturedContainerId, 'error', 'AI 服务暂时不可用: ' + e.message, function() {
          doGenerate();
        });
      }
    }

    doAIOptimize();
  })();
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

// ========== 实施记录上传 ==========
function showUploadRecord(planId) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'uploadModal';
  overlay.innerHTML = '<div class="modal-card" style="max-width:600px;">' +
    '<h3>📸 上传实施记录</h3>' +
    '<div class="form-group"><label>标题</label><input type="text" id="uploadTitle" placeholder="请输入记录标题"></div>' +
    '<div class="form-group"><label>上传文件</label><input type="file" id="uploadFile" multiple accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx" onchange="previewUploadFiles()"><div id="uploadPreview" style="margin-top:8px;display:flex;flex-wrap:wrap;gap:8px;"></div></div>' +
    '<div class="form-group"><label>标签（自定义）</label><input type="text" id="uploadTags" placeholder="多个标签用逗号分隔，如：户外活动,小班,春天"></div>' +
    '<div class="form-group"><label>备注</label><textarea id="uploadNotes" rows="3" placeholder="请输入备注内容，如观察记录、教学反思等"></textarea></div>' +
    '<div class="modal-actions"><button class="btn btn-accent" onclick="doUploadRecord(' + planId + ')">上传</button><button class="btn btn-outline" onclick="closeUploadModal()">取消</button></div>' +
    '</div>';
  document.body.appendChild(overlay);
}

function previewUploadFiles() {
  const files = document.getElementById('uploadFile').files;
  const preview = document.getElementById('uploadPreview');
  preview.innerHTML = '';
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const reader = new FileReader();
    reader.onload = (function(f) {
      return function(e) {
        if (f.type.startsWith('image/')) {
          preview.innerHTML += '<div style="position:relative;"><img src="' + e.target.result + '" style="width:80px;height:80px;object-fit:cover;border-radius:6px;"><span style="position:absolute;top:-4px;right:-4px;background:#4caf50;color:#fff;border-radius:50%;width:18px;height:18px;font-size:11px;display:flex;align-items:center;justify-content:center;">✓</span></div>';
        } else {
          preview.innerHTML += '<div style="display:flex;align-items:center;gap:4px;padding:8px 12px;background:#f0f0f0;border-radius:6px;font-size:12px;">📄 ' + f.name + '</div>';
        }
      };
    })(file);
    reader.readAsDataURL(file);
  }
}

function closeUploadModal() { const modal = document.getElementById('uploadModal'); if (modal) modal.remove(); }

async function doUploadRecord(planId) {
  const user = getCurrentUser();
  if (!user) return;
  const title = document.getElementById('uploadTitle').value.trim();
  if (!title) { alert('请输入标题'); return; }
  const tags = document.getElementById('uploadTags').value.trim();
  const notes = document.getElementById('uploadNotes').value.trim();
  const fileInput = document.getElementById('uploadFile');
  const files = fileInput.files;
  
  const plan = await dbGet('curriculum_plans', planId);
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    let fileData = '';
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      fileData = await new Promise((resolve) => { const reader = new FileReader(); reader.onload = (e) => resolve(e.target.result); reader.readAsDataURL(file); });
    }
    await dbAdd('implementation_records', {
      planId, theme: plan ? (plan.fw || '') : '', kinderId: user.kinderId,
      title: files.length > 1 ? title + ' (' + (i + 1) + ')' : title,
      tags, notes, fileName: file.name, fileSize: file.size,
      fileData, fileType: file.type,
      createdBy: user.name, createdAt: new Date().toISOString()
    });
  }
  
  if (files.length === 0) {
    await dbAdd('implementation_records', {
      planId, theme: plan ? (plan.fw || '') : '', kinderId: user.kinderId,
      title, tags, notes, fileName: '', fileSize: 0,
      fileData: '', fileType: '',
      createdBy: user.name, createdAt: new Date().toISOString()
    });
  }
  
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

// Init
updateNavButtons();
