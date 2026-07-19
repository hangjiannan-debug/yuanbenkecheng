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

/**
 * 游客快速体验：创建虚拟园长账号并登录
 */
async function guestLogin() {
  const guestId = Date.now();
  const kinderName = '演示幼儿园';
  const name = '游客园长';
  const phone = 'guest_' + guestId;
  const password = 'guest';

  try {
    const kinderId = await dbAdd('kinders', { name: kinderName, createdAt: new Date().toISOString() });
    const accountId = await dbAdd('accounts', {
      role: 'principal', name, phone, password, kinderId, createdAt: new Date().toISOString()
    });

    const user = {
      id: accountId, role: 'principal', name,
      phone, kinderId, kinderName
    };
    sessionStorage.setItem(AUTH_KEY, JSON.stringify(user));

    window.location.href = 'app.html';
  } catch (e) {
    alert('游客体验入口出错：' + e.message);
  }
}
