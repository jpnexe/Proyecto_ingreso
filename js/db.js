// Base de datos usando Dexie (IndexedDB)
export const db = new Dexie('universidadDB');

db.version(1).stores({
  users: '++id, email, role, career, semester, status, createdAt, lastLogin',
  reservas: '++id, userId, date, status',
  announcements: '++id, title, createdAt',
  logs: '++id, userId, action, timestamp, details',
  sessions: '++id, userId, sessionId, createdAt, lastActivity',
});

// Módulo DB actual: añadimos soporte SQLite (sql.js) manteniendo API
// ... existing code ...

// --- SQLite (sql.js) adapter con persistencia en IndexedDB ---
let SQL = null;
let sqliteDb = null;
let sqliteReady = false;
const USE_SQLITE = true; // Activar SQLite como capa de almacenamiento principal
const REMOTE_SQLITE_ENDPOINT = '/api/sqlite';

// Cargar sql.js vía npm o CDN de forma robusta
function injectScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = () => resolve(true);
    s.onerror = () => reject(new Error('No se pudo cargar ' + src));
    document.head.appendChild(s);
  });
}
async function loadSqlJs() {
  if (SQL) return;
  // 1) Intentar import dinámico (entornos con bundler)
  try {
    const initSqlJs = (await import('sql.js')).default;
    // En bundlers (Vite), importar la URL del WASM explícitamente
    let wasmUrl = null;
    try {
      wasmUrl = (await import('sql.js/dist/sql-wasm.wasm?url')).default;
    } catch (_) {}
    SQL = await initSqlJs({
      locateFile: (f) => {
        if (f.endsWith('.wasm') && wasmUrl) return wasmUrl;
        // Fallback: dejar el nombre como está (Vite servirá 404 si no existe)
        return f;
      }
    });
    return;
  } catch (_) {}
  // 2) Cargar desde CDN (entorno sin bundler / html plano)
  const CDN_BASE = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0';
  try {
    await injectScript(`${CDN_BASE}/sql-wasm.js`);
    if (!window.initSqlJs) throw new Error('window.initSqlJs no disponible tras cargar CDN');
    SQL = await window.initSqlJs({ locateFile: (f) => `${CDN_BASE}/${f}` });
  } catch (e) {
    console.error('Fallo al cargar sql.js:', e);
    throw new Error('sql.js no disponible (intenté import y CDN).');
  }
}

// Helpers IndexedDB para persistir el archivo SQLite
function idbOpen() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('sqlite_store_v1', 1);
    req.onupgradeneeded = () => req.result.createObjectStore('files');
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function idbGet(key) {
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('files', 'readonly');
    const store = tx.objectStore('files');
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}
async function idbSet(key, value) {
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('files', 'readwrite');
    const store = tx.objectStore('files');
    const req = store.put(value, key);
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}

// --- Persistencia remota (desarrollo): archivo SQLite centralizado en el servidor ---
async function remoteGetSQLite() {
  try {
    const res = await fetch(REMOTE_SQLITE_ENDPOINT, { method: 'GET', cache: 'no-store' });
    if (!res.ok) return null;
    const buf = new Uint8Array(await res.arrayBuffer());
    return buf && buf.length ? buf : null;
  } catch (_) {
    return null; // Si falla, continuamos con IndexedDB local
  }
}

async function remoteSetSQLite(data) {
  try {
    await fetch(REMOTE_SQLITE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/octet-stream' },
      body: data
    });
    return true;
  } catch (_) {
    return false; // Silenciar errores en desarrollo para no interrumpir flujo
  }
}

// Abrir/crear BD SQLite y crear tablas si no existen
async function openSQLite() {
  if (!SQL) await loadSqlJs();
  // Preferir la copia remota compartida; si no existe, usar IndexedDB local; si tampoco, crear nueva
  let buffer = null;
  try { buffer = await remoteGetSQLite(); } catch (_) {}
  if (!buffer) {
    try { buffer = await idbGet('sqlite_db_v1'); } catch (_) { buffer = null; }
  }
  sqliteDb = buffer ? new SQL.Database(new Uint8Array(buffer)) : new SQL.Database();
  sqliteDb.exec(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL,
      password TEXT NOT NULL,
      avatar TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reservas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date INTEGER NOT NULL,
      day TEXT,
      motivo TEXT,
      status TEXT DEFAULT 'pendiente',
      created_at INTEGER NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      author_id INTEGER
    );

    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT NOT NULL,
      meta TEXT,
      timestamp INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      active INTEGER NOT NULL DEFAULT 1
    );

    /* Tareas del calendario */
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'todo',
      priority TEXT NOT NULL DEFAULT 'main',
      assignee TEXT,
      due TEXT,
      tags TEXT,
      comments TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    /* Registros de ingreso */
    CREATE TABLE IF NOT EXISTS entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      method TEXT NOT NULL DEFAULT 'manual',
      created_at INTEGER NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    /* Horarios académicos por carrera y semestre */
    CREATE TABLE IF NOT EXISTS schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      career TEXT NOT NULL,
      semester TEXT NOT NULL,
      label TEXT NOT NULL,
      slots TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    /* Historial de cargues masivos */
    CREATE TABLE IF NOT EXISTS bulk_ops (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      op_type TEXT NOT NULL,
      source TEXT,
      created_count INTEGER NOT NULL,
      updated_count INTEGER NOT NULL,
      failed_count INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS bulk_ops_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bulk_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      before_json TEXT,
      after_json TEXT,
      FOREIGN KEY(bulk_id) REFERENCES bulk_ops(id)
    );
  `);
  sqliteReady = true;
}

async function saveSQLite() {
  if (!sqliteDb) return;
  const data = sqliteDb.export(); // Uint8Array
  await idbSet('sqlite_db_v1', data);
  // Guardar también en el servidor de desarrollo para compartir entre navegadores
  try { await remoteSetSQLite(data); } catch (_) {}
}

// Helpers de consulta
function all(sql, params = []) {
  const stmt = sqliteDb.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}
function run(sql, params = []) {
  sqliteDb.run(sql, params);
}
function scalar(sql, params = []) {
  const rows = all(sql, params);
  const first = rows[0];
  if (!first) return 0;
  const key = Object.keys(first)[0];
  return first[key] ?? 0;
}
async function ensureSQLite() {
  if (!sqliteReady) await openSQLite();
  // Garantizar columnas opcionales inmediatamente después de abrir la BD
  ensureOptionalUserColumns();
  // Asignar códigos a estudiantes que no lo tengan
  try { await ensureStudentCodes(); } catch (e) { console.warn('No se pudieron asignar códigos a estudiantes:', e); }
}

// --- Helpers de migración de columnas ---
function hasColumn(table, column) {
  const info = all(`PRAGMA table_info(${table})`);
  return info.some(r => r.name === column);
}
function addColumnIfMissing(table, column, definition) {
  try {
    if (!hasColumn(table, column)) run(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  } catch (e) {
    console.warn('No se pudo añadir columna', table, column, e);
  }
}

// Asegurar columnas opcionales en users (llamar esto ANTES de hacer queries que las usen)
function ensureOptionalUserColumns() {
  try {
    addColumnIfMissing('users', 'career', 'TEXT');
    addColumnIfMissing('users', 'semester', 'TEXT');
    addColumnIfMissing('users', 'status', "TEXT DEFAULT 'activo'");
    addColumnIfMissing('users', 'last_login', 'INTEGER');
    addColumnIfMissing('users', 'visit_reason', 'TEXT');
    addColumnIfMissing('users', 'user_code', 'TEXT');
    addColumnIfMissing('users', 'schedule_id', 'INTEGER');
  } catch (e) {
    console.warn('No se pudieron asegurar columnas opcionales:', e);
  }
}

// Asignar código visible para estudiantes faltantes (formato UG-<id>)
async function ensureStudentCodes() {
  const rows = all("SELECT id, role, user_code FROM users WHERE role='estudiante' ORDER BY id ASC");
  const toUpdate = rows.filter(r => !r.user_code || String(r.user_code).trim() === '');
  for (const r of toUpdate) {
    run('UPDATE users SET user_code=? WHERE id=?', [`UG-${r.id}`, r.id]);
  }
  if (toUpdate.length) await saveSQLite();
}

// Eliminamos el IIFE y aseguramos columnas explícitamente en ensureSQLite/initDB

// --- Cargador liviano para js-sha256 (fallback en contextos no seguros) ---
async function loadSha256Lib() {
  if (window.sha256) return;
  try {
    await injectScript('https://cdn.jsdelivr.net/npm/js-sha256@0.9.0/build/sha256.min.js');
  } catch (e) {
    console.warn('No se pudo cargar js-sha256 desde CDN:', e);
  }
}

// --- Hash de contraseña (uso crypto.subtle si está disponible, si no fallback a js-sha256) ---
async function hashPassword(password) {
  const msg = String(password || '');
  // Intento con WebCrypto si está disponible
  try {
    if (window.crypto && window.crypto.subtle && typeof window.crypto.subtle.digest === 'function') {
      const msgUint8 = new TextEncoder().encode(msg);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
      return [...new Uint8Array(hashBuffer)].map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (e) {
    console.warn('Fallo usando crypto.subtle, usaré fallback js-sha256:', e);
  }
  // Fallback a js-sha256
  await loadSha256Lib();
  if (window.sha256) {
    return window.sha256(msg);
  }
  // Si no está disponible ninguna, retorno un hash simple (no seguro) para mantener funcionalidad en dev
  console.warn('Usando fallback no seguro de hash por ausencia de WebCrypto y js-sha256.');
  let hash = 0;
  for (let i = 0; i < msg.length; i++) {
    hash = ((hash << 5) - hash) + msg.charCodeAt(i);
    hash |= 0; // 32-bit
  }
  return ('00000000' + (hash >>> 0).toString(16)).slice(-8);
}

// --- Semilla inicial si BD está vacía ---
async function seedIfEmpty() {
  const count = scalar('SELECT COUNT(*) as c FROM users');
  if (count > 0) return;
  const demo = [
    { name: 'Admin', email: 'admin@uni.com', role: 'admin', password: 'admin123', status: 'activo' },
    { name: 'María García Rodríguez', email: 'estudiante@uni.com', role: 'estudiante', password: '123456', status: 'activo', career: 'Ingeniería en sistemas', semester: '3' },
    { name: 'Carlos López Martínez', email: 'visitante@uni.com', role: 'visitante', password: '123456', status: 'activo' },
  ];
  for (const u of demo) {
    const hashed = await hashPassword(u.password);
    run(
      'INSERT INTO users (name, email, role, password, created_at, status, career, semester, visit_reason) VALUES (?,?,?,?,?,?,?,?,?)',
      [u.name, u.email, u.role, hashed, Date.now(), u.status || 'activo', u.career || '', u.semester || '', '']
    );
    // Asignar código visible si es estudiante
    const id = scalar('SELECT last_insert_rowid() as id');
    if (u.role === 'estudiante') {
      run('UPDATE users SET user_code=? WHERE id=?', [`UG-${id}`, id]);
    }
  }
  // Semilla de anuncios
  run('INSERT INTO announcements (title, body, created_at, author_id) VALUES (?,?,?,?)', [
    'Inicio de semestre',
    'El semestre académico inicia el próximo lunes. Consulta tu horario.',
    Date.now(),
    null
  ]);
  run('INSERT INTO announcements (title, body, created_at, author_id) VALUES (?,?,?,?)', [
    'Actualización de biblioteca',
    'Nueva sala de estudio y préstamo de portátiles disponible.',
    Date.now(),
    null
  ]);
  await saveSQLite();
}

export async function seedDemoData(estCount = 36, visCount = 24) {
  await ensureSQLite();
  const totalDemo = scalar("SELECT COUNT(*) as c FROM users WHERE email LIKE 'est.demo%@uni.com' OR email LIKE 'vis.demo%@uni.com'");
  if (totalDemo >= (estCount + visCount)) return;
  const first = ['María','Carlos','Luisa','Juan','Ana','José','Laura','Miguel','Paula','Andrés','Valeria','Daniel','Sofía','David','Camila','Jorge','Natalia','Diego','Fernanda','Santiago','Diana','Felipe','Mónica','Sebastián','Alejandra','Ricardo','Verónica','Óscar','Lina','Manuel'];
  const last = ['García','López','Martínez','Rodríguez','Hernández','González','Pérez','Sánchez','Ramírez','Torres','Flores','Rivera','Reyes','Morales','Ortiz','Guerrero','Castillo','Vargas','Jiménez','Navarro','Rojas','Romero','Cruz','Mendoza','Aguilar','Vega','Silva','Valencia','Salazar','Camacho'];
  const careers = ['Ingeniería en sistemas','Administración de Empresas','Contaduría Pública','Trabajo social','Licenciatura infantil'];
  const visitReasons = ['Visita académica','Evento','Biblioteca','Trámite','Invitado especial','Capacitación'];
  const pick = (arr) => arr[Math.floor(Math.random()*arr.length)];
  const makeName = () => `${pick(first)} ${pick(last)} ${pick(last)}`;
  const addEntriesFor = (userId) => {
    const days = 14;
    const now = new Date();
    const startMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    for (let d = 0; d < days; d++) {
      if (Math.random() < 0.6) {
        const base = startMidnight - d * 86400000;
        const entryTs = base + (7 + Math.floor(Math.random()*5)) * 3600000 + Math.floor(Math.random()*3600000);
        run('INSERT INTO entries (user_id, method, created_at) VALUES (?,?,?)', [userId, 'manual', entryTs]);
        if (Math.random() < 0.9) {
          const exitTs = entryTs + (3 + Math.floor(Math.random()*6)) * 3600000;
          run('INSERT INTO entries (user_id, method, created_at) VALUES (?,?,?)', [userId, 'salida', exitTs]);
        }
      }
    }
  };
  for (let i = 1; i <= estCount; i++) {
    const email = `est.demo${i}@uni.com`;
    const exists = all('SELECT id FROM users WHERE LOWER(email)=LOWER(?) LIMIT 1', [email])[0];
    if (exists) continue;
    const name = makeName();
    const pass = await hashPassword('123456');
    const career = pick(careers);
    const semester = String(1 + Math.floor(Math.random()*10));
    run('INSERT INTO users (name, email, role, password, created_at, status, career, semester, visit_reason) VALUES (?,?,?,?,?,?,?,?,?)', [name, email, 'estudiante', pass, Date.now(), 'activo', career, semester, '']);
    const id = scalar('SELECT last_insert_rowid() as id');
    run('UPDATE users SET user_code=? WHERE id=?', [`UG-${id}`, id]);
    addEntriesFor(id);
  }
  for (let i = 1; i <= visCount; i++) {
    const email = `vis.demo${i}@uni.com`;
    const exists = all('SELECT id FROM users WHERE LOWER(email)=LOWER(?) LIMIT 1', [email])[0];
    if (exists) continue;
    const name = makeName();
    const pass = await hashPassword('123456');
    const reason = pick(visitReasons);
    run('INSERT INTO users (name, email, role, password, created_at, status, career, semester, visit_reason) VALUES (?,?,?,?,?,?,?,?,?)', [name, email, 'visitante', pass, Date.now(), 'activo', '', '', reason]);
    const id = scalar('SELECT last_insert_rowid() as id');
    run('UPDATE users SET user_code=? WHERE id=?', [`UV-${id}`, id]);
    addEntriesFor(id);
  }
  await saveSQLite();
  window.dispatchEvent(new CustomEvent('dbchange', { detail: { type: 'users' } }));
}

// --- Adaptación de initDB para usar SQLite ---
export async function initDB() {
  try {
    await ensureSQLite();
    await seedIfEmpty();
    try { await seedDemoData(36, 24); } catch {}
    await saveSQLite();
  } catch (e) {
    console.error('Fallo al inicializar SQLite. La app continuará (Dexie aún está disponible vía db).', e);
  }
}

export async function registerUser({ name, email, password, role, adminCode, career, semester, status }) {
  await ensureSQLite();
  email = String(email || '').trim().toLowerCase();
  name = String(name || '').trim();
  role = String(role || '').trim();
  if (!name || !email || !password || !role) throw new Error('Completa todos los campos.');
  if (role === 'admin' && adminCode !== 'ADMIN2025') throw new Error('Código de administrador inválido.');
  const exists = all('SELECT id FROM users WHERE LOWER(email)=LOWER(?) LIMIT 1', [email])[0];
  if (exists) throw new Error('Ya existe un usuario con ese correo.');
  const hashed = await hashPassword(password);
  run(
    'INSERT INTO users (name, email, role, password, created_at, status, career, semester, visit_reason) VALUES (?,?,?,?,?,?,?,?,?)',
    [name, email, role, hashed, Date.now(), status || 'activo', role === 'estudiante' ? (career || '') : '', role === 'estudiante' ? (semester || '') : '', '']
  );
  await saveSQLite();
  const id = scalar('SELECT last_insert_rowid() as id');
  // Asignar código visible si es estudiante
  if (role === 'estudiante') {
    run('UPDATE users SET user_code=? WHERE id=?', [`UG-${id}`, id]);
    await saveSQLite();
  }
  // Asignar código visible si es visitante
  if (role === 'visitante') {
    run('UPDATE users SET user_code=? WHERE id=?', [`UV-${id}`, id]);
    await saveSQLite();
  }
  await logAction(id, 'user_created', `Usuario ${role} creado: ${name}`);
  window.dispatchEvent(new CustomEvent('dbchange', { detail: { type: 'users', id } }));
  return id;
}

export async function getUserByEmail(email) {
  await ensureSQLite();
  email = String(email || '').trim().toLowerCase();
  const rows = all('SELECT id, name, email, role, career, semester, status, visit_reason, user_code, schedule_id, created_at, last_login FROM users WHERE LOWER(email)=LOWER(?) LIMIT 1', [email]);
  const r = rows[0];
  if (!r) return null;
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    role: r.role,
    career: r.career || '',
    semester: r.semester || '',
    status: r.status || 'activo',
    visitReason: r.visit_reason || '',
    userCode: r.user_code || '',
    scheduleId: r.schedule_id || null,
    createdAt: new Date(r.created_at).toISOString(),
    lastLogin: r.last_login ? new Date(r.last_login).toISOString() : null,
  };
}

export async function getUserByCode(code) {
  await ensureSQLite();
  code = String(code || '').trim().toUpperCase();
  if (!code) return null;
  const rows = all('SELECT id, name, email, role, career, semester, status, visit_reason, user_code, schedule_id, created_at, last_login FROM users WHERE UPPER(user_code)=? LIMIT 1', [code]);
  const r = rows[0];
  if (!r) return null;
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    role: r.role,
    career: r.career || '',
    semester: r.semester || '',
    status: r.status || 'activo',
    visitReason: r.visit_reason || '',
    userCode: r.user_code || '',
    scheduleId: r.schedule_id || null,
    createdAt: new Date(r.created_at).toISOString(),
    lastLogin: r.last_login ? new Date(r.last_login).toISOString() : null,
  };
}

export async function getUserById(id) {
  await ensureSQLite();
  const rows = all('SELECT id, name, email, role, career, semester, status, visit_reason, user_code, schedule_id, created_at, last_login FROM users WHERE id=? LIMIT 1', [id]);
  const r = rows[0];
  if (!r) return null;
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    role: r.role,
    career: r.career || '',
    semester: r.semester || '',
    status: r.status || 'activo',
    visitReason: r.visit_reason || '',
    userCode: r.user_code || '',
    scheduleId: r.schedule_id || null,
    createdAt: new Date(r.created_at).toISOString(),
    lastLogin: r.last_login ? new Date(r.last_login).toISOString() : null,
  };
}

export async function authenticateUser(email, password) {
  await ensureSQLite();
  email = String(email || '').trim().toLowerCase();
  const rows = all('SELECT id, name, email, role, password, career, semester, status, visit_reason, user_code, created_at, last_login FROM users WHERE LOWER(email)=LOWER(?) LIMIT 1', [email]);
  const r = rows[0];
  if (!r) throw new Error('Usuario no encontrado.');
  const hashed = await hashPassword(password || '');
  if (r.password !== hashed) throw new Error('Contraseña incorrecta.');
  run('UPDATE users SET last_login=? WHERE id=?', [Date.now(), r.id]);
  await saveSQLite();
  await logAction(r.id, 'user_login', `Login exitoso para ${r.name}`);
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    role: r.role,
    career: r.career || '',
    semester: r.semester || '',
    status: r.status || 'activo',
    visitReason: r.visit_reason || '',
    userCode: r.user_code || '',
    createdAt: new Date(r.created_at).toISOString(),
    lastLogin: new Date().toISOString(),
  };
}

export async function listUsers() {
  await ensureSQLite();
  const rows = all('SELECT id, name, email, role, career, semester, status, visit_reason, user_code, schedule_id, created_at, last_login FROM users ORDER BY id ASC');
  return rows.map(r => ({
    id: r.id,
    name: r.name,
    email: r.email,
    role: r.role,
    career: r.career || '',
    semester: r.semester || '',
    status: r.status || 'activo',
    visitReason: r.visit_reason || '',
    userCode: r.user_code || '',
    scheduleId: r.schedule_id || null,
    createdAt: new Date(r.created_at).toISOString(),
    lastLogin: r.last_login ? new Date(r.last_login).toISOString() : null,
  }));
}

export async function updateUser(id, data) {
  await ensureSQLite();
  if (!id) throw new Error('ID de usuario requerido');
  const map = {
    name: 'name',
    email: 'email',
    role: 'role',
    password: 'password',
    career: 'career',
    semester: 'semester',
    status: 'status',
    visitReason: 'visit_reason',
    userCode: 'user_code',
    scheduleId: 'schedule_id'
  };
  const sets = [];
  const params = [];
  for (const k of Object.keys(map)) {
    if (data[k] !== undefined) {
      let val = data[k];
      if (k === 'password' && val && String(val).length < 60) val = await hashPassword(val);
      sets.push(`${map[k]} = ?`);
      params.push(val);
    }
  }
  if (sets.length === 0) return;
  run(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`, [...params, id]);
  await saveSQLite();
  const changes = Object.keys(data).filter(k => k !== 'password').join(', ');
  await logAction(id, 'user_updated', `Usuario actualizado. Campos: ${changes}`);
  window.dispatchEvent(new CustomEvent('dbchange', { detail: { type: 'users', id } }));
}

export async function getUserStats() {
  await ensureSQLite();
  const total = scalar('SELECT COUNT(*) as c FROM users');
  const admins = scalar(`SELECT COUNT(*) as c FROM users WHERE role='admin'`);
  const estudiantes = scalar(`SELECT COUNT(*) as c FROM users WHERE role='estudiante'`);
  const visitantes = scalar(`SELECT COUNT(*) as c FROM users WHERE role='visitante'`);
  return { total, admins, estudiantes, visitantes };
}

export function dayNameFromISO(iso) {
  const d = new Date(iso);
  return ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][d.getDay()];
}

export async function createReserva({ userId, dateISO, motivo }) {
  await ensureSQLite();
  if (!userId || !dateISO || !motivo) throw new Error('Datos de reserva incompletos');
  const exists = all('SELECT id FROM reservas WHERE date=? LIMIT 1', [dateISO])[0];
  if (exists) throw new Error('Horario no disponible, elige otro.');
  run('INSERT INTO reservas (user_id, date, day, motivo, status, created_at) VALUES (?,?,?,?,?,?)', [
    userId,
    dateISO,
    dayNameFromISO(dateISO),
    motivo,
    'pendiente',
    Date.now()
  ]);
  await saveSQLite();
  const id = scalar('SELECT last_insert_rowid() as id');
  window.dispatchEvent(new CustomEvent('dbchange', { detail: { type: 'reservas', id } }));
  return id;
}

export async function listReservas(userId) {
  await ensureSQLite();
  if (!userId) return [];
  const rows = all('SELECT id, user_id, date, day, motivo, status, created_at FROM reservas WHERE user_id=? ORDER BY date ASC', [userId]);
  return rows.map(r => ({
    id: r.id,
    userId: r.user_id,
    date: r.date,
    day: r.day,
    motivo: r.motivo,
    status: r.status || 'pendiente',
    createdAt: new Date(r.created_at).toISOString(),
  }));
}

export async function deleteReserva(reservaId, userId = null) {
  await ensureSQLite();
  if (!reservaId) throw new Error('ID de reserva requerido');
  const r = all('SELECT id, user_id FROM reservas WHERE id=? LIMIT 1', [reservaId])[0];
  if (!r) throw new Error('Reserva no encontrada');
  if (userId && Number(r.user_id) !== Number(userId)) throw new Error('No autorizado para eliminar esta reserva');
  run('DELETE FROM reservas WHERE id=?', [reservaId]);
  await saveSQLite();
  window.dispatchEvent(new CustomEvent('dbchange', { detail: { type: 'reservas', id: reservaId, deleted: true } }));
}

export async function cancelReserva(reservaId, userId = null) {
  await ensureSQLite();
  if (!reservaId) throw new Error('ID de reserva requerido');
  const r = all('SELECT id, user_id FROM reservas WHERE id=? LIMIT 1', [reservaId])[0];
  if (!r) throw new Error('Reserva no encontrada');
  if (userId && Number(r.user_id) !== Number(userId)) throw new Error('No autorizado para cancelar esta reserva');
  run("UPDATE reservas SET status='cancelada' WHERE id=?", [reservaId]);
  await saveSQLite();
  window.dispatchEvent(new CustomEvent('dbchange', { detail: { type: 'reservas', id: reservaId, status: 'cancelada' } }));
}

export async function listAnnouncements() {
  await ensureSQLite();
  const rows = all('SELECT id, title, body, created_at, author_id FROM announcements ORDER BY created_at DESC');
  return rows.map(r => ({
    id: r.id,
    title: r.title,
    body: r.body,
    createdAt: new Date(r.created_at).toISOString(),
    authorId: r.author_id || null,
  }));
}

// --- Sincronización: exportar/importar BD SQLite ---
export async function exportSQLite() {
  await ensureSQLite();
  const data = sqliteDb.export();
  return new Blob([data], { type: 'application/octet-stream' });
}

export async function importSQLite(blob) {
  if (!blob) throw new Error('Archivo de base de datos requerido');
  if (!SQL) await loadSqlJs();
  const buf = new Uint8Array(await blob.arrayBuffer());
  sqliteDb = new SQL.Database(buf);
  sqliteReady = true;
  await saveSQLite();
  window.dispatchEvent(new CustomEvent('dbchange', { detail: { type: 'import' } }));
}

// --- Tareas del calendario (CRUD) ---
export async function listTasks(filters = {}) {
  await ensureSQLite();
  let sql = 'SELECT id, title, status, priority, assignee, due, tags, comments, created_at, updated_at FROM tasks';
  const conds = [];
  const params = [];
  if (filters.status) { conds.push('status = ?'); params.push(filters.status); }
  if (filters.search) { conds.push('(LOWER(title) LIKE ? OR LOWER(assignee) LIKE ?)'); const q = `%${String(filters.search).toLowerCase()}%`; params.push(q, q); }
  if (conds.length) sql += ' WHERE ' + conds.join(' AND ');
  sql += ' ORDER BY updated_at DESC';
  const rows = all(sql, params);
  return rows.map(r => ({
    id: r.id,
    title: r.title,
    status: r.status,
    priority: r.priority,
    assignee: r.assignee || '',
    due: r.due || '',
    tags: (r.tags || '').split(',').map(s => s.trim()).filter(Boolean),
    comments: r.comments || '',
    createdAt: new Date(r.created_at).toISOString(),
    updatedAt: new Date(r.updated_at).toISOString()
  }));
}

export async function createTask({ title, status = 'todo', priority = 'main', assignee = '', due = '', tags = [], comments = '' }) {
  await ensureSQLite();
  const now = Date.now();
  run('INSERT INTO tasks (title, status, priority, assignee, due, tags, comments, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?)', [
    String(title || '').trim() || 'Nueva tarea', status, priority, assignee, due || '', Array.isArray(tags) ? tags.join(', ') : String(tags || ''), comments, now, now
  ]);
  await saveSQLite();
  const id = scalar('SELECT last_insert_rowid() as id');
  try { await logAction(null, 'task_created', `Calendario: ${title}`); } catch {}
  return id;
}

export async function updateTask(id, data) {
  await ensureSQLite();
  if (!id) throw new Error('ID de tarea requerido');
  const map = { title: 'title', status: 'status', priority: 'priority', assignee: 'assignee', due: 'due', tags: 'tags', comments: 'comments' };
  const sets = [];
  const params = [];
  for (const k of Object.keys(map)) {
    if (data[k] !== undefined) {
      const val = (k === 'tags' && Array.isArray(data[k])) ? data[k].join(', ') : data[k];
      sets.push(`${map[k]} = ?`);
      params.push(val);
    }
  }
  sets.push('updated_at = ?');
  params.push(Date.now());
  run(`UPDATE tasks SET ${sets.join(', ')} WHERE id = ?`, [...params, id]);
  await saveSQLite();
}

export async function deleteTask(id) {
  await ensureSQLite();
  run('DELETE FROM tasks WHERE id = ?', [id]);
  await saveSQLite();
  try { await logAction(null, 'task_deleted', `Calendario: id=${id}`); } catch {}
}

// Migración rápida desde localStorage -> SQLite
export async function migrateLocalTasksToSQLite() {
  await ensureSQLite();
  try {
    const raw = localStorage.getItem('adminCalendarTasksV2');
    const items = raw ? JSON.parse(raw) : [];
    if (Array.isArray(items) && items.length) {
      for (const t of items) {
        await createTask({
          title: t.title,
          status: t.status || 'todo',
          priority: t.priority || 'main',
          assignee: t.assignee || '',
          due: t.due || '',
          tags: Array.isArray(t.tags) ? t.tags : [],
          comments: t.comments || ''
        });
      }
      localStorage.removeItem('adminCalendarTasksV2');
    }
  } catch (e) {
    console.warn('No se pudieron migrar tareas locales:', e);
  }
}

// Función para registrar logs de acciones
export async function logAction(userId, action, details) {
  try {
    await ensureSQLite();
    run('INSERT INTO logs (user_id, action, meta, timestamp) VALUES (?,?,?,?)', [
      userId || null,
      action,
      details || '',
      Date.now()
    ]);
    await saveSQLite();
  } catch (error) {
    console.error('Error al registrar log:', error);
  }
}

// Función para obtener logs con filtros
export async function getLogs(filters = {}) {
  await ensureSQLite();
  let sql = 'SELECT id, user_id, action, meta, timestamp FROM logs';
  const conds = [];
  const params = [];
  if (filters.userId) { conds.push('user_id = ?'); params.push(filters.userId); }
  if (filters.action) { conds.push('action = ?'); params.push(filters.action); }
  if (conds.length) sql += ' WHERE ' + conds.join(' AND ');
  sql += ' ORDER BY timestamp DESC';
  if (filters.limit) sql += ` LIMIT ${Number(filters.limit)}`;
  const rows = all(sql, params);
  return rows.map(r => ({ id: r.id, userId: r.user_id, action: r.action, details: r.meta, timestamp: new Date(r.timestamp).toISOString() }));
}

// Función para obtener estadísticas detalladas
export async function getDetailedStats() {
  await ensureSQLite();
  const total = scalar('SELECT COUNT(*) as c FROM users');
  const admins = scalar(`SELECT COUNT(*) as c FROM users WHERE role='admin'`);
  const estudiantes = scalar(`SELECT COUNT(*) as c FROM users WHERE role='estudiante'`);
  const visitantes = scalar(`SELECT COUNT(*) as c FROM users WHERE role='visitante'`);
  const estudiantesActivos = scalar(`SELECT COUNT(*) as c FROM users WHERE role='estudiante' AND status='activo'`);
  const estudiantesInactivos = scalar(`SELECT COUNT(*) as c FROM users WHERE role='estudiante' AND status='inactivo'`);
  const visitantesActivos = scalar(`SELECT COUNT(*) as c FROM users WHERE role='visitante' AND status='activo'`);
  const adminsActivos = scalar(`SELECT COUNT(*) as c FROM users WHERE role='admin' AND status='activo'`);
  const yesterday = Date.now() - 86400000;
  const recentLogins = scalar(`SELECT COUNT(*) as c FROM users WHERE last_login IS NOT NULL AND last_login > ?`, [yesterday]);
  return { total, admins, estudiantes, visitantes, estudiantesActivos, estudiantesInactivos, visitantesActivos, adminsActivos, recentLogins };
}

// Función para obtener usuarios por rol con filtros
export async function getUsersByRole(role, filters = {}) {
  await ensureSQLite();
  const conds = ['role = ?'];
  const params = [role];
  if (filters.status) { conds.push('status = ?'); params.push(filters.status); }
  if (filters.career && role === 'estudiante') { conds.push('career = ?'); params.push(filters.career); }
  if (filters.semester && role === 'estudiante') { conds.push('semester = ?'); params.push(filters.semester); }
  const rows = all(`SELECT id, name, email, role, career, semester, status, visit_reason, user_code, schedule_id, created_at, last_login FROM users WHERE ${conds.join(' AND ')} ORDER BY id ASC`, params);
  return rows.map(r => ({ id: r.id, name: r.name, email: r.email, role: r.role, career: r.career || '', semester: r.semester || '', status: r.status || 'activo', visitReason: r.visit_reason || '', userCode: r.user_code || '', scheduleId: r.schedule_id || null, createdAt: new Date(r.created_at).toISOString(), lastLogin: r.last_login ? new Date(r.last_login).toISOString() : null }));
}

// Función para eliminar usuario (con logs)
export async function deleteUser(id) {
  await ensureSQLite();
  const user = all('SELECT id, name, role FROM users WHERE id=?', [id])[0];
  if (!user) throw new Error('Usuario no encontrado');
  run('DELETE FROM users WHERE id=?', [id]);
  await saveSQLite();
  await logAction(id, 'user_deleted', `Usuario eliminado: ${user.name} (${user.role})`);
  window.dispatchEvent(new CustomEvent('dbchange', { detail: { type: 'users', id } }));
}

// Función para crear sesión
export async function createSession(userId) {
  await ensureSQLite();
  const token = crypto.randomUUID();
  run('INSERT INTO sessions (user_id, token, created_at, active) VALUES (?,?,?,1)', [userId, token, Date.now()]);
  await saveSQLite();
  const id = scalar('SELECT last_insert_rowid() as id');
  return { id, sessionId: token };
}

// Función para validar sesión
export async function validateSession(sessionId) {
  await ensureSQLite();
  const rows = all('SELECT id, user_id, token, created_at, active FROM sessions WHERE token=? AND active=1 LIMIT 1', [sessionId]);
  const r = rows[0];
  if (!r) return null;
  return { id: r.id, userId: r.user_id, sessionId: r.token, createdAt: new Date(r.created_at).toISOString(), active: !!r.active };
}

// Función para cerrar sesión
export async function closeSession(sessionId) {
  await ensureSQLite();
  const s = all('SELECT id, user_id FROM sessions WHERE token=? LIMIT 1', [sessionId])[0];
  if (s) {
    run('UPDATE sessions SET active=0 WHERE id=?', [s.id]);
    await saveSQLite();
    await logAction(s.user_id, 'session_closed', 'Sesión cerrada');
  }
}

// Función para resetear la base de datos (solo para desarrollo)
export async function resetDatabase() {
  await ensureSQLite();
  sqliteDb.exec(`
    DELETE FROM users;
    DELETE FROM reservas;
    DELETE FROM announcements;
    DELETE FROM logs;
    DELETE FROM sessions;
    DELETE FROM tasks;
    DELETE FROM entries;
    DELETE FROM schedules;
    DELETE FROM bulk_ops_items;
    DELETE FROM bulk_ops;
  `);
  await saveSQLite();
  await seedIfEmpty();
  window.dispatchEvent(new CustomEvent('dbchange', { detail: { type: 'reset' } }));
}

// --- Ingresos (entries) ---
export async function registerEntry(userId, method = 'manual') {
  await ensureSQLite();
  run('INSERT INTO entries (user_id, method, created_at) VALUES (?,?,?)', [userId, String(method||'manual'), Date.now()]);
  await saveSQLite();
  try { await logAction(userId, 'entry_registered', `Ingreso por ${method}`); } catch {}
  const id = scalar('SELECT last_insert_rowid() as id');
  return id;
}

export async function listEntriesByUser(userId, limit = 20) {
  await ensureSQLite();
  const rows = all('SELECT id, user_id, method, created_at FROM entries WHERE user_id=? ORDER BY created_at DESC LIMIT '+Number(limit||20), [userId]);
  return rows.map(r => ({ id: r.id, userId: r.user_id, method: r.method || 'manual', createdAt: new Date(r.created_at).toISOString() }));
}

export async function getLastEntryForUser(userId) {
  await ensureSQLite();
  const rows = all('SELECT id, created_at FROM entries WHERE user_id=? ORDER BY created_at DESC LIMIT 1', [userId]);
  const r = rows[0];
  return r ? new Date(r.created_at).toISOString() : null;
}

export async function getDailyEntryStats(days = 7) {
  await ensureSQLite();
  const now = new Date();
  const startMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = startMidnight.getTime() - (Math.max(1, days) - 1) * 86400000;
  const rows = all(
    'SELECT e.created_at AS ts, u.role AS role FROM entries e INNER JOIN users u ON u.id = e.user_id WHERE e.created_at >= ? ORDER BY e.created_at ASC',
    [start]
  );
  const dayKey = (ms) => new Date(ms).toISOString().slice(0, 10);
  const daysArr = Array.from({ length: Math.max(1, days) }, (_, i) => new Date(start + i * 86400000));
  const idx = new Map(daysArr.map((d, i) => [dayKey(d.getTime()), i]));
  const est = Array(daysArr.length).fill(0);
  const vis = Array(daysArr.length).fill(0);
  const adm = Array(daysArr.length).fill(0);
  for (const r of rows) {
    const k = dayKey(r.ts);
    const i = idx.get(k);
    if (i !== undefined) {
      const role = String(r.role || '').toLowerCase();
      if (role === 'estudiante') est[i]++;
      else if (role === 'visitante') vis[i]++;
      else if (role === 'admin') adm[i]++;
    }
  }
  const labels = daysArr.map(d => d.toISOString().slice(0, 10));
  return { labels, estudiantes: est, visitantes: vis, admins: adm };
}
export async function getEntryExitStats(days = 7) {
  await ensureSQLite();
  const now = new Date();
  const startMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = startMidnight.getTime() - (Math.max(1, days) - 1) * 86400000;
  const rows = all('SELECT method, created_at FROM entries WHERE created_at >= ? ORDER BY created_at ASC', [start]);
  const dayKey = (ms) => new Date(ms).toISOString().slice(0, 10);
  const daysArr = Array.from({ length: Math.max(1, days) }, (_, i) => new Date(start + i * 86400000));
  const idx = new Map(daysArr.map((d, i) => [dayKey(d.getTime()), i]));
  const entries = Array(daysArr.length).fill(0);
  const exits = Array(daysArr.length).fill(0);
  for (const r of rows) {
    const k = dayKey(r.created_at);
    const i = idx.get(k);
    if (i !== undefined) {
      const m = String(r.method || 'manual');
      if (m.startsWith('salida')) exits[i]++;
      else entries[i]++;
    }
  }
  const labels = daysArr.map(d => d.toISOString().slice(0, 10));
  return { labels, entries, exits };
}
export async function getHourlyEntryStats(days = 7) {
  await ensureSQLite();
  const now = new Date();
  const startMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = startMidnight.getTime() - (Math.max(1, days) - 1) * 86400000;
  const rows = all('SELECT method, created_at FROM entries WHERE created_at >= ? ORDER BY created_at ASC', [start]);
  const counts = Array(24).fill(0);
  for (const r of rows) {
    const m = String(r.method || 'manual');
    if (m.startsWith('salida')) continue;
    const h = new Date(r.created_at).getHours();
    counts[h]++;
  }
  const labels = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  return { labels, entries: counts };
}
export async function registerExit(userId, { auto = false, at } = {}) {
  await ensureSQLite();
  const method = auto ? 'salida_auto' : 'salida';
  const ts = at ? Number(at) : Date.now();
  run('INSERT INTO entries (user_id, method, created_at) VALUES (?,?,?)', [userId, method, ts]);
  await saveSQLite();
  try { await logAction(userId, 'exit_registered', auto ? 'Salida automática (no registró salida)' : 'Salida registrada'); } catch {}
  const id = scalar('SELECT last_insert_rowid() as id');
  return id;
}

export async function ensureAutoExitForUser(userId) {
  await ensureSQLite();
  const rows = all('SELECT created_at, method FROM entries WHERE user_id=? ORDER BY created_at ASC', [userId]);
  if (!rows.length) return 0;
  const pad2 = (n) => String(n).padStart(2, '0');
  const makeLocalKey = (ms) => {
    const d = new Date(ms);
    return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
  };
  const todayKey = makeLocalKey(Date.now());
  const byDay = new Map();
  for (const r of rows) {
    const k = makeLocalKey(r.created_at);
    if (!byDay.has(k)) byDay.set(k, []);
    byDay.get(k).push(String(r.method || 'manual'));
  }
  let inserted = 0;
  for (const [k, methods] of byDay.entries()) {
    if (k >= todayKey) continue;
    const hadEntry = methods.some(m => !String(m).startsWith('salida'));
    const hadExit = methods.some(m => String(m).startsWith('salida'));
    if (hadEntry && !hadExit) {
      const parts = k.split('-');
      const y = Number(parts[0]);
      const m = Number(parts[1]) - 1;
      const d = Number(parts[2]);
      const endMs = new Date(y, m, d + 1).getTime() - 1000;
      const exists = all('SELECT id FROM entries WHERE user_id=? AND method=? AND created_at=? LIMIT 1', [userId, 'salida_auto', endMs])[0];
      if (!exists) {
        await registerExit(userId, { auto: true, at: endMs });
        inserted++;
      }
    }
  }
  return inserted;
}

// --- Horarios académicos ---
function canonicalizeCareer(c) {
  const s = String(c||'').trim();
  if (!s) return '';
  const map = {
    'ingeniería en sistemas': 'Ingeniería en sistemas',
    'administración de empresas': 'Administración de Empresas',
    'contaduría pública': 'Contaduría Pública',
    'trabajo social': 'Trabajo social',
    'licenciatura infantil': 'Licenciatura infantil',
  };
  const k = s.toLowerCase();
  return map[k] || s;
}

function coursePoolFor(career, semester) {
  const c = canonicalizeCareer(career);
  const pools = {
    'Ingeniería en sistemas': ['Algoritmos', 'Bases de Datos', 'Redes', 'Inteligencia Artificial', 'Programación', 'Sistemas Operativos', 'Ingeniería de Software'],
    'Administración de Empresas': ['Administración I', 'Finanzas', 'Marketing', 'Economía', 'Gestión de Proyectos', 'Estadística'],
    'Contaduría Pública': ['Contabilidad I', 'Contabilidad II', 'Auditoría', 'Costos', 'Tributaria', 'Finanzas'],
    'Trabajo social': ['Metodología', 'Psicología Social', 'Intervención Comunitaria', 'Ética Profesional', 'Investigación'],
    'Licenciatura infantil': ['Didáctica I', 'Pedagogía', 'Psicología Educativa', 'Lenguaje y Comunicación', 'Matemática Básica'],
    '': ['Curso General']
  };
  const base = pools[c] || pools[''];
  const s = String(semester||'').trim();
  if (!s) return base;
  return base.map(n => `${n} (${s})`);
}

function randomPick(arr) { return arr[Math.floor(Math.random()*arr.length)]; }

function buildRandomSlots(career, semester) {
  const days = ['Lunes','Martes','Miércoles','Jueves','Viernes'];
  const times = ['08:00 - 10:00','10:00 - 12:00','14:00 - 16:00','16:00 - 18:00'];
  const courses = coursePoolFor(career, semester);
  const rows = times.map(t => {
    const row = { time: t };
    const activeDays = [...days].sort(() => Math.random()-0.5).slice(2 + Math.floor(Math.random()*2));
    for (const d of days) {
      row[d] = activeDays.includes(d) ? randomPick(courses) : '';
    }
    return row;
  });
  return rows;
}

export async function ensureSchedulesForCareerSemester(career, semester, min = 2) {
  await ensureSQLite();
  const canon = canonicalizeCareer(career);
  const rows = all('SELECT COUNT(*) as c FROM schedules WHERE career=? AND semester=?', [canon, String(semester||'').trim()]);
  const count = Number(rows[0]?.c || 0);
  const need = Math.max(0, min - count);
  for (let i=0; i<need; i++) {
    const label = `Plan ${String.fromCharCode(65 + i + count)}`;
    const slots = buildRandomSlots(canon, semester);
    run('INSERT INTO schedules (career, semester, label, slots, created_at) VALUES (?,?,?,?,?)', [canon, String(semester||'').trim(), label, JSON.stringify(slots), Date.now()]);
  }
  if (need) await saveSQLite();
}

export async function listSchedules(career, semester) {
  await ensureSQLite();
  const canon = canonicalizeCareer(career);
  const rows = all('SELECT id, career, semester, label, slots, created_at FROM schedules WHERE career=? AND semester=? ORDER BY id ASC', [canon, String(semester||'').trim()]);
  return rows.map(r => ({ id: r.id, career: r.career, semester: r.semester, label: r.label, slots: JSON.parse(r.slots || '[]'), createdAt: new Date(r.created_at).toISOString() }));
}

export async function getScheduleById(id) {
  await ensureSQLite();
  const rows = all('SELECT id, career, semester, label, slots, created_at FROM schedules WHERE id=? LIMIT 1', [id]);
  const r = rows[0];
  if (!r) return null;
  return { id: r.id, career: r.career, semester: r.semester, label: r.label, slots: JSON.parse(r.slots||'[]'), createdAt: new Date(r.created_at).toISOString() };
}

export async function assignScheduleToUser(userId, scheduleId) {
  await ensureSQLite();
  run('UPDATE users SET schedule_id=? WHERE id=?', [scheduleId || null, userId]);
  await saveSQLite();
  await logAction(userId, 'schedule_assigned', `Horario asignado: ${scheduleId || 'none'}`);
  window.dispatchEvent(new CustomEvent('dbchange', { detail: { type: 'users', id: userId } }));
}

export async function getAssignedScheduleForUser(userId) {
  await ensureSQLite();
  const rows = all('SELECT schedule_id, career, semester FROM users WHERE id=? LIMIT 1', [userId]);
  const r = rows[0];
  if (!r) return null;
  const sid = r.schedule_id || null;
  if (sid) return await getScheduleById(sid);
  await ensureSchedulesForCareerSemester(r.career || '', r.semester || '', 2);
  const list = await listSchedules(r.career || '', r.semester || '');
  return list[0] || null;
}

export async function generateSchedulesForExistingCombos(min = 2) {
  await ensureSQLite();
  const combos = all("SELECT DISTINCT career, semester FROM users WHERE role='estudiante' AND career<>'' AND semester<>''");
  for (const c of combos) {
    await ensureSchedulesForCareerSemester(c.career, c.semester, min);
  }
}

// --- Utilidades para eliminación en cascada ---
export async function deleteUserCascade(id) {
  await ensureSQLite();
  const user = all('SELECT id, name, role FROM users WHERE id=?', [id])[0];
  if (!user) return 0;
  run('DELETE FROM reservas WHERE user_id=?', [id]);
  run('DELETE FROM entries WHERE user_id=?', [id]);
  run('DELETE FROM sessions WHERE user_id=?', [id]);
  run('DELETE FROM logs WHERE user_id=?', [id]);
  run('DELETE FROM users WHERE id=?', [id]);
  await saveSQLite();
  window.dispatchEvent(new CustomEvent('dbchange', { detail: { type: 'users', id } }));
  return 1;
}

export async function massDeleteUsersByFilter(type, filters = {}) {
  await ensureSQLite();
  const role = type === 'visitante' ? 'visitante' : 'estudiante';
  const users = await getUsersByRole(role, filters);
  let count = 0;
  for (const u of users) { count += await deleteUserCascade(u.id); }
  return count;
}

// --- Historial de cargues masivos ---
export async function recordBulkOp(opType, source, summary, items) {
  await ensureSQLite();
  const createdCount = (items||[]).filter(it => String(it.action||'') === 'created').length;
  const updatedCount = (items||[]).filter(it => String(it.action||'') === 'updated').length;
  const failedCount = Number(summary?.failed||0);
  run('INSERT INTO bulk_ops (op_type, source, created_count, updated_count, failed_count, created_at) VALUES (?,?,?,?,?,?)', [String(opType||''), String(source||'csv'), createdCount, updatedCount, failedCount, Date.now()]);
  await saveSQLite();
  const id = scalar('SELECT last_insert_rowid() as id');
  for (const it of (items||[])) {
    run('INSERT INTO bulk_ops_items (bulk_id, user_id, action, before_json, after_json) VALUES (?,?,?,?,?)', [id, Number(it.user_id||0), String(it.action||'created'), it.before_json ? JSON.stringify(it.before_json) : null, it.after_json ? JSON.stringify(it.after_json) : null]);
  }
  await saveSQLite();
  window.dispatchEvent(new CustomEvent('dbchange', { detail: { type: 'bulk_ops', id } }));
  return id;
}

export async function listBulkOps() {
  await ensureSQLite();
  const rows = all('SELECT id, op_type, source, created_count, updated_count, failed_count, created_at FROM bulk_ops ORDER BY created_at DESC');
  return rows.map(r => ({ id: r.id, type: r.op_type, source: r.source || 'csv', created: r.created_count, updated: r.updated_count, failed: r.failed_count, createdAt: new Date(r.created_at).toISOString() }));
}

export async function listBulkOpItems(bulkId) {
  await ensureSQLite();
  const rows = all('SELECT id, bulk_id, user_id, action, before_json, after_json FROM bulk_ops_items WHERE bulk_id=? ORDER BY id ASC', [bulkId]);
  return rows.map(r => ({ id: r.id, bulkId: r.bulk_id, userId: r.user_id, action: r.action, before: r.before_json ? JSON.parse(r.before_json) : null, after: r.after_json ? JSON.parse(r.after_json) : null }));
}

export async function undoBulkOp(bulkId) {
  await ensureSQLite();
  const items = await listBulkOpItems(bulkId);
  let reverted = 0;
  for (const it of items) {
    if (it.action === 'created') {
      reverted += await deleteUserCascade(it.userId);
    } else if (it.action === 'updated' && it.before) {
      const patch = {};
      if (it.before.name !== undefined) patch.name = it.before.name;
      if (it.before.career !== undefined) patch.career = it.before.career;
      if (it.before.semester !== undefined) patch.semester = it.before.semester;
      if (it.before.status !== undefined) patch.status = it.before.status;
      if (it.before.visitReason !== undefined) patch.visitReason = it.before.visitReason;
      if (it.before.userCode !== undefined) patch.userCode = it.before.userCode;
      try { await updateUser(it.userId, patch); reverted++; } catch {}
    }
  }
  return reverted;
}

export async function deleteCreatedUsersByBulkId(bulkId) {
  await ensureSQLite();
  const rows = all('SELECT DISTINCT user_id FROM bulk_ops_items WHERE bulk_id=? AND action=?', [bulkId, 'created']);
  let cnt = 0;
  for (const r of rows) { cnt += await deleteUserCascade(r.user_id); }
  return cnt;
}

export async function deleteCreatedUsersAcrossAllBulks() {
  await ensureSQLite();
  const rows = all("SELECT DISTINCT user_id FROM bulk_ops_items WHERE action='created'");
  let cnt = 0;
  for (const r of rows) { cnt += await deleteUserCascade(r.user_id); }
  return cnt;
}

export async function recalcBulkOpsSummaries() {
  await ensureSQLite();
  const ops = all('SELECT id, failed_count FROM bulk_ops ORDER BY id DESC');
  for (const o of ops) {
    const items = all('SELECT action FROM bulk_ops_items WHERE bulk_id=?', [o.id]);
    const createdCount = items.filter(x => String(x.action||'') === 'created').length;
    const updatedCount = items.filter(x => String(x.action||'') === 'updated').length;
    let failedCount = Number(o.failed_count||0);
    if ((createdCount + updatedCount) > 0 && failedCount >= items.length) failedCount = 0;
    run('UPDATE bulk_ops SET created_count=?, updated_count=?, failed_count=? WHERE id=?', [createdCount, updatedCount, failedCount, o.id]);
  }
  await saveSQLite();
}