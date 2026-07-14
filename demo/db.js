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
