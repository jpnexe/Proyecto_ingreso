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

// Cargar sql.js vía npm o CDN
async function loadSqlJs() {
  try {
    const initSqlJs = (await import('sql.js')).default;
    SQL = await initSqlJs({
      // En Vite no hace falta locateFile si se resuelve el asset
      locateFile: (file) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}`
    });
  } catch (e) {
    if (window.initSqlJs) {
      SQL = await window.initSqlJs({
        locateFile: (file) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}`
      });
    } else {
      throw new Error('sql.js no disponible. Instala con npm i sql.js o añade CDN.');
    }
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

// Abrir/crear BD SQLite y crear tablas si no existen
async function openSQLite() {
  if (!SQL) await loadSqlJs();
  const buffer = await idbGet('sqlite_db_v1');
  if (buffer) {
    sqliteDb = new SQL.Database(new Uint8Array(buffer));
  } else {
    sqliteDb = new SQL.Database();
  }
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
  `);
  sqliteReady = true;
}

async function saveSQLite() {
  if (!sqliteDb) return;
  const data = sqliteDb.export(); // Uint8Array
  await idbSet('sqlite_db_v1', data);
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
}

// --- Hash de contraseña (reutilizamos si ya existe) ---
async function hashPassword(password) {
  const msgUint8 = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  return [...new Uint8Array(hashBuffer)].map(b => b.toString(16).padStart(2, '0')).join('');
}

// --- Semilla inicial si BD está vacía ---
async function seedIfEmpty() {
  const count = scalar('SELECT COUNT(*) as c FROM users');
  if (count > 0) return;
  const demo = [
    { name: 'Admin', email: 'admin@uni.com', role: 'admin', password: 'admin123' },
    { name: 'María García Rodríguez', email: 'estudiante@uni.com', role: 'estudiante', password: '123456' },
    { name: 'Carlos López Martínez', email: 'visitante@uni.com', role: 'visitante', password: '123456' },
  ];
  for (const u of demo) {
    const hashed = await hashPassword(u.password);
    run(
      'INSERT INTO users (name, email, role, password, created_at) VALUES (?,?,?,?,?)',
      [u.name, u.email, u.role, hashed, Date.now()]
    );
  }
  await saveSQLite();
}

// --- Adaptación de initDB para usar SQLite ---
export async function initDB() {
  const hasUsers = await db.users.count();
  if (hasUsers === 0) {
    // Sembrar admin por defecto y anuncios
    await registerUser({
      name: 'Admin',
      email: 'admin@uni.com',
      password: 'admin123',
      role: 'admin',
      adminCode: 'ADMIN2025',
      status: 'activo',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    });
    
    // Agregar usuario de prueba para estudiantes
    await registerUser({
      name: 'María García Rodríguez',
      email: 'estudiante@uni.com',
      password: '123456',
      role: 'estudiante',
      career: 'ingenieria',
      semester: '3',
      status: 'activo',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    });
    
    // Agregar más estudiantes de prueba
    await registerUser({
      name: 'Juan Pérez Silva',
      email: 'juan.perez@uni.com',
      password: '123456',
      role: 'estudiante',
      career: 'medicina',
      semester: '5',
      status: 'activo',
      createdAt: new Date().toISOString(),
      lastLogin: new Date(Date.now() - 86400000).toISOString(), // Ayer
    });
    
    await registerUser({
      name: 'Ana Martínez López',
      email: 'ana.martinez@uni.com',
      password: '123456',
      role: 'estudiante',
      career: 'derecho',
      semester: '2',
      status: 'inactivo',
      createdAt: new Date().toISOString(),
      lastLogin: new Date(Date.now() - 172800000).toISOString(), // Hace 2 días
    });
    
    // Agregar usuario de prueba para visitantes
    await registerUser({
      name: 'Carlos López Martínez',
      email: 'visitante@uni.com',
      password: '123456',
      role: 'visitante',
      status: 'activo',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    });
    
    // Más visitantes de prueba
    await registerUser({
      name: 'Laura Rodríguez Gómez',
      email: 'laura.rodriguez@gmail.com',
      password: '123456',
      role: 'visitante',
      status: 'activo',
      createdAt: new Date().toISOString(),
      lastLogin: new Date(Date.now() - 43200000).toISOString(), // Hace 12 horas
    });
    
    await db.announcements.bulkAdd([
      {
        title: 'Inicio de semestre',
        body: 'El semestre académico inicia el próximo lunes. Consulta tu horario.',
        createdAt: new Date().toISOString(),
      },
      {
        title: 'Actualización de biblioteca',
        body: 'Nueva sala de estudio y préstamo de portátiles disponible.',
        createdAt: new Date().toISOString(),
      },
      {
        title: 'Semana de bienestar',
        body: 'Jornadas deportivas y de salud durante toda la semana.',
        createdAt: new Date().toISOString(),
      },
      {
        title: 'Inscripciones abiertas',
        body: 'Las inscripciones para el próximo semestre están disponibles hasta el 15 de diciembre.',
        createdAt: new Date().toISOString(),
      },
      {
        title: 'Conferencia de Ingeniería',
        body: 'Gran conferencia sobre nuevas tecnologías en ingeniería. Auditorio principal, 2:00 PM.',
        createdAt: new Date().toISOString(),
      },
    ]);
  }
}

export async function registerUser({ name, email, password, role, adminCode, career, semester, status }) {
  email = String(email || '').trim().toLowerCase();
  name = String(name || '').trim();
  role = String(role || '').trim();
  if (!name || !email || !password || !role) {
    throw new Error('Completa todos los campos.');
  }
  if (role === 'admin' && adminCode !== 'ADMIN2025') {
    throw new Error('Código de administrador inválido.');
  }
  const exists = await db.users.where('email').equals(email).first();
  if (exists) throw new Error('Ya existe un usuario con ese correo.');
  const hashed = await hashPassword(password);
  
  const userData = { 
    name, 
    email, 
    password: hashed, 
    role,
    status: status || 'activo',
    createdAt: new Date().toISOString(),
    lastLogin: null
  };
  
  // Agregar campos específicos para estudiantes
  if (role === 'estudiante') {
    userData.career = career || '';
    userData.semester = semester || '';
  }
  
  const id = await db.users.add(userData);
  
  // Registrar log de creación
  await logAction(id, 'user_created', `Usuario ${role} creado: ${name}`);
  
  window.dispatchEvent(new CustomEvent('dbchange', { detail: { type: 'users', id } }));
  return id;
}

export async function authenticateUser(email, password) {
  email = String(email || '').trim().toLowerCase();
  const user = await db.users.where('email').equals(email).first();
  if (!user) throw new Error('Usuario no encontrado.');
  const hashed = await hashPassword(password || '');
  if (user.password !== hashed) throw new Error('Contraseña incorrecta.');
  
  // Actualizar último login
  await db.users.update(user.id, { lastLogin: new Date().toISOString() });
  
  // Registrar log de login
  await logAction(user.id, 'user_login', `Login exitoso para ${user.name}`);
  
  return { ...user, lastLogin: new Date().toISOString() };
}

export async function listUsers() {
  return db.users.toArray();
}

export async function updateUser(id, data) {
  if (!id) throw new Error('ID de usuario requerido');
  const allowed = ['name', 'email', 'role', 'password', 'career', 'semester', 'status'];
  const update = {};
  for (const k of allowed) if (data[k] !== undefined) update[k] = data[k];
  if (update.password && update.password.length < 60) {
    // Si viene plano, hashearlo
    update.password = await hashPassword(update.password);
  }
  
  const oldUser = await db.users.get(id);
  await db.users.update(id, update);
  
  // Registrar log de actualización
  const changes = Object.keys(update).filter(k => k !== 'password').join(', ');
  await logAction(id, 'user_updated', `Usuario actualizado. Campos: ${changes}`);
  
  window.dispatchEvent(new CustomEvent('dbchange', { detail: { type: 'users', id } }));
}

export async function getUserStats() {
  const total = await db.users.count();
  const admins = await db.users.where('role').equals('admin').count();
  const estudiantes = await db.users.where('role').equals('estudiante').count();
  const visitantes = await db.users.where('role').equals('visitante').count();
  return { total, admins, estudiantes, visitantes };
}

export function dayNameFromISO(iso) {
  const d = new Date(iso);
  return ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][d.getDay()];
}

export async function createReserva({ userId, dateISO, motivo }) {
  if (!userId || !dateISO || !motivo) throw new Error('Datos de reserva incompletos');
  const existing = await db.reservas.where('date').equals(dateISO).first();
  if (existing) throw new Error('Horario no disponible, elige otro.');
  const id = await db.reservas.add({
    userId,
    date: dateISO,
    day: dayNameFromISO(dateISO),
    motivo,
    createdAt: new Date().toISOString(),
  });
  window.dispatchEvent(new CustomEvent('dbchange', { detail: { type: 'reservas', id } }));
  return id;
}

export async function listReservas(userId) {
  if (!userId) return [];
  const arr = await db.reservas.where('userId').equals(userId).toArray();
  arr.sort((a, b) => new Date(a.date) - new Date(b.date));
  return arr;
}

export async function listAnnouncements() {
  return db.announcements.toArray();
}

// Función para registrar logs de acciones
export async function logAction(userId, action, details) {
  try {
    await db.logs.add({
      userId,
      action,
      details,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error al registrar log:', error);
  }
}

// Función para obtener logs con filtros
export async function getLogs(filters = {}) {
  let query = db.logs.orderBy('timestamp').reverse();
  
  if (filters.userId) {
    query = query.filter(log => log.userId === filters.userId);
  }
  
  if (filters.action) {
    query = query.filter(log => log.action === filters.action);
  }
  
  if (filters.limit) {
    return query.limit(filters.limit).toArray();
  }
  
  return query.toArray();
}

// Función para obtener estadísticas detalladas
export async function getDetailedStats() {
  const total = await db.users.count();
  const admins = await db.users.where('role').equals('admin').count();
  const estudiantes = await db.users.where('role').equals('estudiante').count();
  const visitantes = await db.users.where('role').equals('visitante').count();
  
  // Estadísticas de estudiantes
  const estudiantesActivos = await db.users.where('role').equals('estudiante').and(user => user.status === 'activo').count();
  const estudiantesInactivos = await db.users.where('role').equals('estudiante').and(user => user.status === 'inactivo').count();
  
  // Estadísticas de visitantes
  const visitantesActivos = await db.users.where('role').equals('visitante').and(user => user.status === 'activo').count();
  
  // Estadísticas de administradores
  const adminsActivos = await db.users.where('role').equals('admin').and(user => user.status === 'activo').count();
  
  // Últimos logins (últimas 24 horas)
  const yesterday = new Date(Date.now() - 86400000).toISOString();
  const recentLogins = await db.users.filter(user => user.lastLogin && user.lastLogin > yesterday).count();
  
  return {
    total,
    admins,
    estudiantes,
    visitantes,
    estudiantesActivos,
    estudiantesInactivos,
    visitantesActivos,
    adminsActivos,
    recentLogins
  };
}

// Función para obtener usuarios por rol con filtros
export async function getUsersByRole(role, filters = {}) {
  let query = db.users.where('role').equals(role);
  
  if (filters.status) {
    query = query.filter(user => user.status === filters.status);
  }
  
  if (filters.career && role === 'estudiante') {
    query = query.filter(user => user.career === filters.career);
  }
  
  if (filters.semester && role === 'estudiante') {
    query = query.filter(user => user.semester === filters.semester);
  }
  
  return query.toArray();
}

// Función para eliminar usuario (con logs)
export async function deleteUser(id) {
  const user = await db.users.get(id);
  if (!user) throw new Error('Usuario no encontrado');
  
  await db.users.delete(id);
  await logAction(id, 'user_deleted', `Usuario eliminado: ${user.name} (${user.role})`);
  
  window.dispatchEvent(new CustomEvent('dbchange', { detail: { type: 'users', id } }));
}

// Función para crear sesión
export async function createSession(userId) {
  const sessionId = crypto.randomUUID();
  const id = await db.sessions.add({
    userId,
    sessionId,
    createdAt: new Date().toISOString(),
    lastActivity: new Date().toISOString()
  });
  
  return { id, sessionId };
}

// Función para validar sesión
export async function validateSession(sessionId) {
  const session = await db.sessions.where('sessionId').equals(sessionId).first();
  if (!session) return null;
  
  // Actualizar última actividad
  await db.sessions.update(session.id, { lastActivity: new Date().toISOString() });
  
  return session;
}

// Función para cerrar sesión
export async function closeSession(sessionId) {
  const session = await db.sessions.where('sessionId').equals(sessionId).first();
  if (session) {
    await db.sessions.delete(session.id);
    await logAction(session.userId, 'session_closed', 'Sesión cerrada');
  }
}

// Función para resetear la base de datos (solo para desarrollo)
export async function resetDatabase() {
  await db.users.clear();
  await db.reservas.clear();
  await db.announcements.clear();
  await db.logs.clear();
  await db.sessions.clear();
  await initDB();
}