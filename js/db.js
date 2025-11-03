// Base de datos usando Dexie (IndexedDB)
export const db = new Dexie('universidadDB');

db.version(1).stores({
  users: '++id, email, role',
  reservas: '++id, userId, date',
  announcements: '++id, title',
});

export async function hashPassword(password) {
  const enc = new TextEncoder();
  const data = enc.encode(password);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

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
    });
    
    // Agregar usuario de prueba para estudiantes
    await registerUser({
      name: 'María García Rodríguez',
      email: 'estudiante@uni.com',
      password: '123456',
      role: 'estudiante',
    });
    
    // Agregar usuario de prueba para visitantes
    await registerUser({
      name: 'Carlos López Martínez',
      email: 'visitante@uni.com',
      password: '123456',
      role: 'visitante',
    });
    
    await db.announcements.bulkAdd([
      {
        title: 'Inicio de semestre',
        body: 'El semestre académico inicia el próximo lunes. Consulta tu horario.',
        createdAt: new Date(),
      },
      {
        title: 'Actualización de biblioteca',
        body: 'Nueva sala de estudio y préstamo de portátiles disponible.',
        createdAt: new Date(),
      },
      {
        title: 'Semana de bienestar',
        body: 'Jornadas deportivas y de salud durante toda la semana.',
        createdAt: new Date(),
      },
      {
        title: 'Inscripciones abiertas',
        body: 'Las inscripciones para el próximo semestre están disponibles hasta el 15 de diciembre.',
        createdAt: new Date(),
      },
      {
        title: 'Conferencia de Ingeniería',
        body: 'Gran conferencia sobre nuevas tecnologías en ingeniería. Auditorio principal, 2:00 PM.',
        createdAt: new Date(),
      },
    ]);
  }
}

export async function registerUser({ name, email, password, role, adminCode }) {
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
  const id = await db.users.add({ name, email, password: hashed, role });
  window.dispatchEvent(new CustomEvent('dbchange', { detail: { type: 'users', id } }));
  return id;
}

export async function authenticateUser(email, password) {
  email = String(email || '').trim().toLowerCase();
  const user = await db.users.where('email').equals(email).first();
  if (!user) throw new Error('Usuario no encontrado.');
  const hashed = await hashPassword(password || '');
  if (user.password !== hashed) throw new Error('Contraseña incorrecta.');
  return user;
}

export async function listUsers() {
  return db.users.toArray();
}

export async function updateUser(id, data) {
  if (!id) throw new Error('ID de usuario requerido');
  const allowed = ['name', 'email', 'role', 'password'];
  const update = {};
  for (const k of allowed) if (data[k] !== undefined) update[k] = data[k];
  if (update.password && update.password.length < 60) {
    // Si viene plano, hashearlo
    update.password = await hashPassword(update.password);
  }
  await db.users.update(id, update);
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

// Función para resetear la base de datos (solo para desarrollo)
export async function resetDatabase() {
  await db.users.clear();
  await db.reservas.clear();
  await db.announcements.clear();
  await initDB();
}