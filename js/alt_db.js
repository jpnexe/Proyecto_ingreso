// Base de datos SQLite alternativa e independiente para verificación entre navegadores
// Usa sql.js y persiste en IndexedDB bajo claves distintas a db.js

let SQL_ALT = null;
let altDb = null;
let altReady = false;

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

async function loadSqlJsAlt() {
  if (SQL_ALT) return;
  try {
    const initSqlJs = (await import('sql.js')).default;
    let wasmUrl = null;
    try { wasmUrl = (await import('sql.js/dist/sql-wasm.wasm?url')).default; } catch (_) {}
    SQL_ALT = await initSqlJs({
      locateFile: (f) => {
        if (f.endsWith('.wasm') && wasmUrl) return wasmUrl;
        return f;
      }
    });
    return;
  } catch (_) {}
  // Fallback CDN
  const CDN_BASE = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0';
  await injectScript(`${CDN_BASE}/sql-wasm.js`);
  if (!window.initSqlJs) throw new Error('initSqlJs no disponible (alt)');
  SQL_ALT = await window.initSqlJs({ locateFile: (f) => `${CDN_BASE}/${f}` });
}

function idbOpenAlt() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('sqlite_alt_store_v1', 1);
    req.onupgradeneeded = () => req.result.createObjectStore('files');
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function idbGetAlt(key) {
  const db = await idbOpenAlt();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('files', 'readonly');
    const store = tx.objectStore('files');
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}
async function idbSetAlt(key, value) {
  const db = await idbOpenAlt();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('files', 'readwrite');
    const store = tx.objectStore('files');
    const req = store.put(value, key);
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}

async function openAltSQLite() {
  if (!SQL_ALT) await loadSqlJsAlt();
  const buffer = await idbGetAlt('sqlite_alt_db_v1');
  if (buffer) {
    altDb = new SQL_ALT.Database(new Uint8Array(buffer));
  } else {
    altDb = new SQL_ALT.Database();
  }
  altDb.exec(`
    PRAGMA journal_mode = WAL;

    /* BD alternativa mínima: solo tareas para verificación */
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
  `);
  altReady = true;
}

async function saveAltSQLite() {
  if (!altDb) return;
  const data = altDb.export();
  await idbSetAlt('sqlite_alt_db_v1', data);
}

function allAlt(sql, params = []) {
  const stmt = altDb.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}
function runAlt(sql, params = []) { altDb.run(sql, params); }
function scalarAlt(sql, params = []) {
  const rows = allAlt(sql, params);
  const first = rows[0];
  if (!first) return 0;
  const key = Object.keys(first)[0];
  return first[key] ?? 0;
}
async function ensureAltSQLite() {
  if (!altReady) await openAltSQLite();
}

// --- Exportar/Importar BD alternativa ---
export async function altExportSQLite() {
  await ensureAltSQLite();
  const data = altDb.export();
  return new Blob([data], { type: 'application/octet-stream' });
}
export async function altImportSQLite(blob) {
  if (!blob) throw new Error('Archivo de BD alterna requerido');
  if (!SQL_ALT) await loadSqlJsAlt();
  const buf = new Uint8Array(await blob.arrayBuffer());
  altDb = new SQL_ALT.Database(buf);
  altReady = true;
  await saveAltSQLite();
}

// --- CRUD de tareas en BD alternativa ---
export async function altListTasks() {
  await ensureAltSQLite();
  const rows = allAlt('SELECT id, title, status, priority, assignee, due, tags, comments, created_at, updated_at FROM tasks ORDER BY updated_at DESC');
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

export async function altCreateTask({ title, status = 'todo', priority = 'main', assignee = '', due = '', tags = [], comments = '' }) {
  await ensureAltSQLite();
  const now = Date.now();
  runAlt('INSERT INTO tasks (title, status, priority, assignee, due, tags, comments, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?)', [
    String(title || '').trim() || 'Nueva tarea', status, priority, assignee, due || '', Array.isArray(tags) ? tags.join(', ') : String(tags || ''), comments, now, now
  ]);
  await saveAltSQLite();
  return scalarAlt('SELECT last_insert_rowid() as id');
}

export async function altUpdateTask(id, data) {
  await ensureAltSQLite();
  if (!id) throw new Error('ID de tarea requerido (alt)');
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
  runAlt(`UPDATE tasks SET ${sets.join(', ')} WHERE id = ?`, [...params, id]);
  await saveAltSQLite();
}

export async function altDeleteTask(id) {
  await ensureAltSQLite();
  runAlt('DELETE FROM tasks WHERE id = ?', [id]);
  await saveAltSQLite();
}

// Reemplazar todas las tareas (sincronización con BD principal)
export async function altReplaceAllTasks(tasks = []) {
  await ensureAltSQLite();
  runAlt('DELETE FROM tasks');
  for (const t of tasks) {
    const now = Date.now();
    runAlt('INSERT INTO tasks (title, status, priority, assignee, due, tags, comments, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?)', [
      String(t.title || '').trim(), t.status || 'todo', t.priority || 'main', t.assignee || '', t.due || '', Array.isArray(t.tags) ? t.tags.join(', ') : String(t.tags || ''), t.comments || '', now, now
    ]);
  }
  await saveAltSQLite();
}