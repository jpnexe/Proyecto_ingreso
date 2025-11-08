import { logAction, getUserStats, listUsers, updateUser, deleteUser, listReservas, getUserById, getUserByEmail, registerUser, getLogs } from '../js/db.js';

export function render() {
  return `
    <div class="admin-dashboard-modern">
      <aside class="sidebar">
        <div class="sidebar-header">
          <button class="sidebar-toggle"><i class="fas fa-bars"></i></button>
          <span>Mi ingreso dashboard</span>
        </div>
        <nav class="sidebar-nav">
          <a href="#" class="nav-item" data-section="buscar"><i class="fas fa-search"></i><span class="nav-label">Buscar</span></a>
          <a href="#" class="nav-item active" data-section="inicio"><i class="fas fa-home"></i><span class="nav-label">Inicio</span></a>
          <a href="#" class="nav-item" data-section="reportes"><i class="fas fa-flag"></i><span class="nav-label">Reportes</span></a>
          <a href="#" class="nav-item" data-section="estadisticas"><i class="fas fa-chart-pie"></i><span class="nav-label">Estadísticas</span></a>
          <a href="#" class="nav-item" data-section="mensajes"><i class="fas fa-envelope"></i><span class="nav-label">Mensajes</span></a>
          <a href="#" class="nav-item" data-section="calendario"><i class="fas fa-calendar-alt"></i><span class="nav-label">Calendario</span></a>
          <a href="#" class="nav-item" data-section="usuarios"><i class="fas fa-users"></i><span class="nav-label">Usuarios</span></a>
          <a href="#" class="nav-item" data-section="ajustes"><i class="fas fa-cog"></i><span class="nav-label">Ajustes</span></a>
          <button type="button" class="nav-item theme-toggle"><i class="fas fa-moon"></i><span class="nav-label">Modo oscuro</span></button>
        </nav>
      </aside>
      <main class="main-content">
        <header class="top-bar">
          <div class="top-bar-left"></div>
          <div class="top-bar-right">
            <div class="identity-pill">
              <div class="notifications">
                <i class="fas fa-bell"></i>
                <span class="notification-badge">0</span>
                <div class="notifications-popover hidden" role="dialog" aria-label="Novedades recientes">
                  <div class="notif-header">Novedades recientes</div>
                  <ul id="notif-preview" class="notif-list"></ul>
                  <div class="notif-actions">
                    <button id="notif-open-reportes" class="btn btn-sm" title="Ver todas">Ver todas</button>
                  </div>
                </div>
              </div>
              <div class="user-profile">
                <span class="user-name">Administrador</span>
                <span class="user-role">Administrador</span>
                <img src="https://i.pravatar.cc/40" alt="User Avatar" class="user-avatar">
              </div>
            </div>
            <button id="logout-dashboard" class="logout-btn" title="Cerrar sesión">
              <i class="fas fa-power-off"></i>
              <span class="logout-label">Cerrar sesión</span>
            </button>
          </div>
        </header>
        <div id="section-area">
          <section class="kpi-grid">
            <div class="kpi-card dark">
              <div class="kpi-header"><span>Total de usuarios</span><i class="fas fa-users"></i></div>
              <div id="kpi-total-users" class="kpi-value">-</div>
              <div class="kpi-change positive">Actualizado</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-header"><span>Administradores</span><i class="fas fa-user-shield"></i></div>
              <div id="kpi-admins" class="kpi-value">-</div>
              <div class="kpi-change positive">Actualizado</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-header"><span>Estudiantes</span><i class="fas fa-user-graduate"></i></div>
              <div id="kpi-estudiantes" class="kpi-value">-</div>
              <div class="kpi-change positive">Actualizado</div>
            </div>
            <div class="kpi-card clickable" id="kpi-register-entry">
              <div class="kpi-header"><span>Registrar ingreso</span><i class="fas fa-qrcode"></i></div>
              <div class="kpi-value">QR / Código</div>
              <div class="kpi-change positive">Nuevo</div>
            </div>
          </section>
          <section class="charts-grid">
            <div class="chart-card"><div class="chart-header"><h3>Registros diarios por rol</h3><button class="chart-settings"><i class="fas fa-cog"></i></button></div><canvas id="daily-role-registrations-chart"></canvas></div>
            <div class="chart-card"><div class="chart-header"><h3>Estudiantes por carrera</h3><button class="chart-settings"><i class="fas fa-cog"></i></button></div><canvas id="career-distribution-chart"></canvas></div>
          </section>
          <section class="recent-customers">
            <div class="recent-customers-header"><h3>Usuarios recientes</h3><button class="chart-settings"><i class="fas fa-cog"></i></button></div>
            <div class="recent-customers-table">
              <table>
                <thead>
                  <tr>
                    <th></th>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Rol</th>
                  </tr>
                </thead>
                <tbody id="recent-users-body"></tbody>
                <tfoot id="recent-users-summary"></tfoot>
              </table>
            </div>
            <div class="view-all-container">
              <a href="#" class="view-all-btn">Ver todos</a>
            </div>
          </section>
        </div>
      </main>
    </div>
  `;
}

export function mount({ currentUser, navigate, showToast } = {}) {
  // Router interno de secciones
  const sectionArea = document.getElementById('section-area');
  const navItems = Array.from(document.querySelectorAll('.sidebar-nav .nav-item')).filter(i => i.getAttribute('data-section'));
  const setActive = (key) => {
    navItems.forEach(i => {
      if (i.getAttribute('data-section') === key) i.classList.add('active');
      else i.classList.remove('active');
    });
  };

  // Actualizar el nombre del administrador en el óvalo superior
  const pillNameEl = document.querySelector('.identity-pill .user-name');
  const pillRoleEl = document.querySelector('.identity-pill .user-role');
  if (pillRoleEl) {
    pillRoleEl.textContent = 'Administrador';
  }
  const pillAvatarEl = document.querySelector('.identity-pill .user-avatar');
  if (pillNameEl) pillNameEl.textContent = currentUser?.name || 'Administrador';
  if (pillRoleEl) pillRoleEl.textContent = 'Administrador';
  if (pillAvatarEl && currentUser?.name) pillAvatarEl.alt = currentUser.name;

  // Notificaciones: vincular badge al total de logs y vista previa (top 3)
  const notifWrap = document.querySelector('.notifications');
  const notifBadgeEl = document.querySelector('.notifications .notification-badge');
  const notifPopover = document.querySelector('.notifications .notifications-popover');
  const notifListEl = document.getElementById('notif-preview');
  const openAllBtn = document.getElementById('notif-open-reportes');
  const navReportes = document.querySelector('.sidebar-nav .nav-item[data-section="reportes"]');

  const updateNotifCount = async () => {
    try {
      const logs = await getLogs();
      const count = (logs || []).length;
      if (notifBadgeEl) {
        notifBadgeEl.textContent = String(count);
        notifBadgeEl.style.display = count > 0 ? 'inline-block' : 'none';
      }
      return logs || [];
    } catch (e) {
      console.warn('No se pudo obtener logs para notificaciones:', e);
      return [];
    }
  };

  const deriveCategory = (a) => {
    if (!a) return 'sistema';
    if (a.includes('login') || a.includes('session')) return 'auth';
    if (a.includes('user')) return 'usuarios';
    if (a.includes('task')) return 'tareas';
    return 'sistema';
  };
  const deriveSeverity = (a) => {
    if (!a) return 'info';
    if (a.includes('deleted') || a.includes('reset')) return 'warn';
    if (a.includes('error')) return 'error';
    return 'info';
  };
  const fmtDateShort = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString('es-ES', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
    } catch { return iso; }
  };

  const renderNotifPreview = (logs) => {
    if (!notifListEl) return;
    const top3 = (logs || []).slice(0,3).map(l => ({
      ...l,
      category: deriveCategory(String(l.action||'')),
      severity: deriveSeverity(String(l.action||'')),
    }));
    notifListEl.innerHTML = top3.length ? top3.map(l => `
      <li class="notif-item">
        <div class="notif-row">
          <span class="notif-time">${fmtDateShort(l.timestamp)}</span>
          <span class="notif-cat">${l.category}</span>
          <span class="notif-sev ${l.severity}">${l.severity}</span>
        </div>
        <div class="notif-msg">${l.details ? l.details : l.action}</div>
      </li>
    `).join('') : '<li class="notif-empty">No hay novedades</li>';
  };

  const openPopover = () => { if (notifPopover) notifPopover.classList.remove('hidden'); };
  const closePopover = () => { if (notifPopover) notifPopover.classList.add('hidden'); };

  if (notifWrap) {
    notifWrap.addEventListener('click', async (e) => {
      e.stopPropagation();
      const logs = await updateNotifCount();
      renderNotifPreview(logs);
      if (notifPopover?.classList.contains('hidden')) openPopover(); else closePopover();
    });
    document.addEventListener('click', (ev) => { if (!notifWrap.contains(ev.target)) closePopover(); });
  }
  if (openAllBtn && navReportes) {
    openAllBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closePopover();
      navReportes.click();
    });
  }

  // Inicializar contador al montar
  updateNotifCount();

  const templates = {
    inicio: () => `
      <section class="kpi-grid">
        <div class="kpi-card dark"><div class="kpi-header"><span>Total de usuarios</span><i class="fas fa-users"></i></div><div id="kpi-total-users" class="kpi-value">-</div><div class="kpi-change positive">Actualizado</div></div>
        <div class="kpi-card"><div class="kpi-header"><span>Administradores</span><i class="fas fa-user-shield"></i></div><div id="kpi-admins" class="kpi-value">-</div><div class="kpi-change positive">Actualizado</div></div>
        <div class="kpi-card"><div class="kpi-header"><span>Estudiantes</span><i class="fas fa-user-graduate"></i></div><div id="kpi-estudiantes" class="kpi-value">-</div><div class="kpi-change positive">Actualizado</div></div>
        <div class="kpi-card"><div class="kpi-header"><span>Visitantes</span><i class="fas fa-user"></i></div><div id="kpi-visitantes" class="kpi-value">-</div><div class="kpi-change positive">Actualizado</div></div>
        <div class="kpi-card clickable" id="kpi-register-entry"><div class="kpi-header"><span>Registrar ingreso</span><i class="fas fa-qrcode"></i></div><div class="kpi-value">QR / Código</div><div class="kpi-change positive">Nuevo</div></div>
      </section>
      <section class="charts-grid">
        <div class="chart-card"><div class="chart-header"><h3>Registros diarios por rol</h3><button class="chart-settings"><i class="fas fa-cog"></i></button></div><canvas id="daily-role-registrations-chart"></canvas></div>
        <div class="chart-card"><div class="chart-header"><h3>Estudiantes por carrera</h3><button class="chart-settings"><i class="fas fa-cog"></i></button></div><canvas id="career-distribution-chart"></canvas></div>
      </section>
      <section class="recent-customers">
        <div class="recent-customers-header"><h3>Usuarios recientes</h3><button class="chart-settings"><i class="fas fa-cog"></i></button></div>
        <div class="recent-customers-table">
          <table>
            <thead><tr><th></th><th>Nombre</th><th>Correo</th><th>Rol</th></tr></thead>
            <tbody id="recent-users-body"></tbody>
            <tfoot id="recent-users-summary"></tfoot>
          </table>
        </div>
        <div class="view-all-container"><a href="#" class="view-all-btn">Ver todos</a></div>

        <div class="daily-registrations">
          <div class="recent-customers-header"><h3>Registros por día</h3></div>
          <div class="recent-customers-table">
            <table>
              <thead><tr><th>Día</th><th>Registros</th></tr></thead>
              <tbody id="daily-registrations-body"></tbody>
            </table>
          </div>
        </div>
      </section>
    `,
    reportes: () => `
      <section class="reports-section chart-card logs-card">
        <div class="chart-header">
          <h3>Novedades del sistema</h3>
          <div class="logs-actions" aria-label="Controles de filtrado de logs">
            <input type="search" id="logs-search" placeholder="Buscar evento o detalle" />
            <select id="logs-category">
              <option value="">Todas las categorías</option>
              <option value="auth">Autenticación</option>
              <option value="usuarios">Usuarios</option>
              <option value="tareas">Tareas</option>
              <option value="sistema">Sistema</option>
            </select>
            <select id="logs-severity">
              <option value="">Todas las severidades</option>
              <option value="info">Info</option>
              <option value="warn">Advertencia</option>
              <option value="error">Error</option>
            </select>
            <input type="date" id="logs-start" title="Fecha inicio" />
            <input type="date" id="logs-end" title="Fecha fin" />
            <button id="logs-clear" class="btn btn-sm" title="Limpiar filtros">Limpiar</button>
          </div>
        </div>
        <div class="logs-list-wrap">
          <ul id="logs-list" class="logs-list" aria-live="polite"></ul>
        </div>
        <div class="logs-footer">
          <div class="logs-summary" id="logs-summary"></div>
        </div>
      </section>
    `,
    estadisticas: () => `
      <section class="charts-grid">
        <div class="chart-card"><div class="chart-header"><h3>Usuarios activos por rol</h3></div><canvas id="users-stats-chart"></canvas></div>
        <div class="chart-card"><div class="chart-header"><h3>Actividad semanal</h3></div><canvas id="activity-stats-chart"></canvas></div>
      </section>
    `,
    mensajes: () => `
      <section class="messages-section chart-card">
        <div class="chart-header"><h3>Mensajes</h3></div>
        <table>
          <thead><tr><th>Remitente</th><th>Asunto</th><th>Estado</th></tr></thead>
          <tbody>
            <tr><td>Soporte</td><td>Bienvenido al sistema</td><td>Leído</td></tr>
            <tr><td>Dirección</td><td>Actualización de política</td><td>No leído</td></tr>
          </tbody>
        </table>
      </section>
    `,
    calendario: () => `
      <section class="calendar-section chart-card">
        <div class="chart-header"><h3>Tareas</h3></div>
        <div class="calendar-board">
          <div class="tasks-column">
            <div class="tasks-top">
              <input type="search" id="task-search" placeholder="Buscar" />
              <div class="segmented" role="tablist">
                <button class="seg-btn active" data-filter="todo">Por hacer</button>
                <button class="seg-btn" data-filter="in_progress">En progreso</button>
              </div>
            </div>
            <div id="tasks-list" class="tasks-list"></div>
          </div>
          <div class="task-detail-column">
            <div class="task-detail">
              <h3>Tarea</h3>
              <label class="detail-label">Descripción</label>
              <input id="detail-title" type="text" placeholder="Título de la tarea" />
              <div class="detail-row">
                <label>Asignado a</label>
                <input id="detail-assignee" type="text" placeholder="Nombre" />
              </div>
              <div class="detail-row">
                <label>Fecha de entrega</label>
                <input id="detail-due" type="date" />
              </div>
              <div class="detail-row">
                <label>Etiquetas</label>
                <input id="detail-tags" type="text" placeholder="etiqueta1, etiqueta2" />
              </div>
              <div class="detail-row">
                <label>Comentarios</label>
                <textarea id="detail-comments" rows="3" placeholder="Comentarios"></textarea>
              </div>
              <div class="detail-actions">
                <button id="detail-save" class="btn">Guardar</button>
                <button id="detail-delete" class="btn btn-danger">Eliminar</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    `,
    usuarios: () => `
      <section class="users-section chart-card">
        <div class="chart-header"><h3>Gestión de usuarios</h3></div>
        <div class="users-actions">
          <div class="users-actions-left">
            <div class="role-tabs">
              <button class="btn btn-sm role-tab active" data-role="estudiante">Estudiantes</button>
              <button class="btn btn-sm role-tab" data-role="visitante">Visitantes</button>
              <button class="btn btn-sm role-tab" data-role="admin">Administradores</button>
            </div>
            <div class="filters-group" id="students-filters">
              <select id="students-filter-career">
                <option value="">Todas las carreras</option>
              </select>
              <select id="students-filter-semester">
                <option value="">Todos los semestres</option>
              </select>
              <select id="students-filter-status">
                <option value="">Todos los estados</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
          </div>
          <div class="users-actions-right">
            <input type="search" id="user-search" placeholder="Buscar por nombre o correo" />
            <button id="user-add-btn" class="btn btn-primary" title="Añadir un nuevo registro"><i class="fas fa-plus"></i> Añadir registro</button>
          </div>
        </div>
        <div class="users-table-wrap">
          <table class="users-table">
            <thead id="users-table-head">
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Carrera</th>
                <th>Semestre</th>
                <th style="width:140px">Acciones</th>
              </tr>
            </thead>
            <tbody id="users-table-body"></tbody>
          </table>
        </div>

        <!-- Modal de edición de usuario -->
        <div id="user-edit-modal" class="modal hidden">
          <div class="modal-content">
            <div class="modal-header">
              <h3 id="user-edit-title">Editar usuario</h3>
              <button class="modal-close" id="user-edit-close">&times;</button>
            </div>
            <div class="modal-body">
              <div class="form-grid">
                <input type="hidden" id="edit-user-id" />
                <label>Nombre</label>
                <input type="text" id="edit-user-name" placeholder="Nombre completo" />
                <label>Correo</label>
                <input type="email" id="edit-user-email" placeholder="correo@ejemplo.com" />
                <label>Rol</label>
                <select id="edit-user-role">
                  <option value="admin">Administrador</option>
                  <option value="estudiante">Estudiante</option>
                  <option value="visitante">Visitante</option>
                </select>
                <label>Estado</label>
                <select id="edit-user-status">
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
                <label>Nueva contraseña</label>
                <input type="password" id="edit-user-password" placeholder="Deja vacío para mantener" />

                <div id="admin-fields" class="admin-only" style="display:none">
                  <label>Código administrador</label>
                  <input type="password" id="edit-user-admin-code" placeholder="ADMIN2025" />
                </div>

                <div id="student-fields" class="student-only">
                  <label>Carrera</label>
                  <select id="edit-user-career">
                    <option value="">Seleccionar carrera</option>
                    <option value="Administración de Empresas">Administración de Empresas</option>
                    <option value="Contaduría Pública">Contaduría Pública</option>
                    <option value="Trabajo social">Trabajo social</option>
                    <option value="Ingeniería en sistemas">Ingeniería en sistemas</option>
                    <option value="Licenciatura infantil">Licenciatura infantil</option>
                    <option value="Sin carrera">Sin carrera</option>
                  </select>
                  <label>Semestre</label>
                  <select id="edit-user-semester">
                    <option value="">Seleccionar semestre</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                    <option value="7">7</option>
                    <option value="8">8</option>
                    <option value="9">9</option>
                    <option value="10">10</option>
                  </select>
                </div>
                <div id="visitor-fields" class="visitor-only">
                  <label>Motivo de la visita</label>
                  <input type="text" id="edit-user-visit-reason" placeholder="Motivo..." />
                </div>
              </div>
              <p id="user-edit-error" class="form-error"></p>
            </div>
            <div class="modal-footer">
              <button id="user-edit-save" class="btn">Guardar cambios</button>
              <button id="user-edit-delete" class="btn btn-danger">Eliminar usuario</button>
            </div>
          </div>
        </div>
      </section>
    `,
    ajustes: () => `
      <section class="settings-section chart-card">
        <div class="chart-header"><h3>Ajustes del panel</h3></div>
        <p>Opciones generales del dashboard. Próximamente más controles.</p>
      </section>
    `,
    buscar: () => `
      <section class="search-section chart-card">
        <div class="chart-header"><h3>Buscar</h3></div>
        <input type="search" id="search-input" placeholder="Buscar en el panel" />
        <p>Escribe para filtrar contenido (demo).</p>
      </section>
    `,
  };

  let salesChart = null;
  let categoriesChart = null;
  let dailyRegsChart = null;

  const initInicioCharts = async () => {
    const categoriesCanvas = document.getElementById('career-distribution-chart');
    const dailyCanvas = document.getElementById('daily-role-registrations-chart');
    if (!categoriesCanvas) return;

    // Distribución de estudiantes por carrera (dinámico desde BD)
    const categoriesCtx = categoriesCanvas.getContext('2d');
    let users = await listUsers();
    const students = (users || []).filter(u => (u.role || '') === 'estudiante');

    // Carreras solicitadas (solo estas deben aparecer) y colores fijos
    const preferredCareers = [
      'Administración de Empresas',
      'Contaduría Pública',
      'Trabajo social',
      'Ingeniería en sistemas',
      'Licenciatura infantil',
      'Sin carrera'
    ];
    const careerColorsMap = {
      'Administración de Empresas': '#1abc9c',
      'Contaduría Pública': '#e67e22',
      'Trabajo social': '#9b59b6',
      'Ingeniería en sistemas': '#3498db',
      'Licenciatura infantil': '#e74c3c',
      'Sin carrera': '#7f8c8d'
    };

    // Normalización para emparejar nombres con/ sin acentos y variaciones de mayúsculas
    const normalize = (s) => (s || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
    const canonicalLookup = {
      'administracion de empresas': 'Administración de Empresas',
      'contaduria publica': 'Contaduría Pública',
      'trabajo social': 'Trabajo social',
      'ingenieria en sistemas': 'Ingeniería en sistemas',
      'licenciatura infantil': 'Licenciatura infantil',
      'sin carrera': 'Sin carrera'
    };
    const canonicalizeCareer = (s) => canonicalLookup[normalize(s)] || null;

    // Inicializar contadores solo para las carreras preferidas
    const counters = new Map(preferredCareers.map(l => [l, 0]));
    students.forEach(u => {
      const raw = u.career || '';
      const canon = canonicalizeCareer(raw);
      const isEmpty = normalize(raw) === '';
      const key = canon || (isEmpty ? 'Sin carrera' : null);
      if (key && counters.has(key)) {
        counters.set(key, (counters.get(key) || 0) + 1);
      }
    });

    // Construir datos únicamente para las carreras indicadas
    const labels = [...preferredCareers];
    const data = labels.map(l => counters.get(l) || 0);
    const colors = labels.map(l => careerColorsMap[l]);

    categoriesChart = new Chart(categoriesCtx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{ label: 'Estudiantes por carrera', data, backgroundColor: colors, borderWidth: 0 }]
      },
      options: { responsive: true, maintainAspectRatio: true, aspectRatio: 1.2, resizeDelay: 150, plugins: { legend: { position: 'bottom' } } }
    });

    // Gráfico de barras: registros diarios por rol (últimos 7 días)
    if (dailyCanvas) {
      const dailyCtx = dailyCanvas.getContext('2d');
      const today = new Date();
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        days.push(d);
      }
      const dayKey = (d) => new Date(d).toISOString().slice(0, 10);
      const labelFmt = (d) => d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
      const labelsDays = days.map(labelFmt);
      const users2 = users.filter(u => !!u.createdAt);
      const countFor = (role, d) => users2.filter(u => (u.role||'') === role && dayKey(u.createdAt) === dayKey(d)).length;
      const estData = days.map(d => countFor('estudiante', d));
      const visData = days.map(d => countFor('visitante', d));

      dailyRegsChart = new Chart(dailyCtx, {
        type: 'bar',
        data: {
          labels: labelsDays,
          datasets: [
            { label: 'Estudiantes', data: estData, backgroundColor: '#2ecc71' },
            { label: 'Visitantes', data: visData, backgroundColor: '#3498db' },
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: 1.6,
          resizeDelay: 150,
          scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
          plugins: { legend: { position: 'top', align: 'start' } }
        }
      });
    }
  };

  // Datos reales para KPIs y usuarios recientes
  const roleLabel = (r) => {
    if (!r) return '';
    if (r === 'admin') return 'Administrador';
    if (r === 'estudiante') return 'Estudiante';
    if (r === 'visitante') return 'Visitante';
    return r;
  };

  const populateRecentUsers = async () => {
    const tbody = document.getElementById('recent-users-body');
    const tfoot = document.getElementById('recent-users-summary');
    if (!tbody) return;
    let users = await listUsers();
    users = (users || []).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    const top = users.slice(0, 3);
    tbody.innerHTML = top.map(u => `
      <tr>
        <td><div class="user-avatar">${(u.name||'').charAt(0).toUpperCase()}</div></td>
        <td>${u.name || ''}</td>
        <td>${u.email || ''}</td>
        <td>${roleLabel(u.role)}</td>
      </tr>
    `).join('');

    if (tfoot) {
      const stats = await getUserStats();
      tfoot.innerHTML = `
        <tr class="summary-row">
          <td></td>
          <td colspan="3">Total: ${stats.total||0} | Administradores: ${stats.admins||0} | Estudiantes: ${stats.estudiantes||0} | Visitantes: ${stats.visitantes||0}</td>
        </tr>
      `;
    }
  };

  const populateDailyRegistrations = async () => {
    const tbody = document.getElementById('daily-registrations-body');
    if (!tbody) return;
    let users = await listUsers();
    users = (users || []).filter(u => !!u.createdAt);
    const byDay = new Map();
    users.forEach(u => {
      const key = new Date(u.createdAt).toISOString().slice(0, 10);
      byDay.set(key, (byDay.get(key) || 0) + 1);
    });
    const sorted = Array.from(byDay.entries()).sort((a, b) => new Date(a[0]) - new Date(b[0]));
    const last7 = sorted.slice(-7);
    tbody.innerHTML = (last7.length ? last7 : sorted).map(([d, c]) => {
      const label = new Date(d + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: 'short' });
      return `<tr><td>${label}</td><td>${c}</td></tr>`;
    }).join('') || '<tr><td colspan="2">Sin datos</td></tr>';
  };

  const initInicioData = async () => {
    try {
      const stats = await getUserStats();
      const totalEl = document.getElementById('kpi-total-users');
      const adminsEl = document.getElementById('kpi-admins');
      const estEl = document.getElementById('kpi-estudiantes');
      const visEl = document.getElementById('kpi-visitantes');
      if (totalEl) totalEl.textContent = String(stats.total || 0);
      if (adminsEl) adminsEl.textContent = String(stats.admins || 0);
      if (estEl) estEl.textContent = String(stats.estudiantes || 0);
      if (visEl) visEl.textContent = String(stats.visitantes || 0);
      await populateRecentUsers();
      await populateDailyRegistrations();
    } catch (e) {
      console.error('Error al inicializar KPIs de Inicio:', e);
    }
  };

  // --- Registro de ingreso (QR / Código) ---
  let qrStream = null;
  let scanTimer = null;
  let detector = null;

  const findUserByCode = async (raw) => {
    const code = String(raw || '').trim().toLowerCase();
    if (!code) return null;
    let user = await getUserByEmail(code);
    if (user) return user;
    const m = code.match(/(?:uid:|ug-)(\d+)/);
    if (m) {
      user = await getUserById(Number(m[1]));
      if (user) return user;
    }
    const allUsers = await listUsers();
    const arr = allUsers.filter(u => (u.userCode || '').toLowerCase() === code);
    return arr[0] || null;
  };

  const processEntry = async (value, source = 'manual') => {
    const user = await findUserByCode(value);
    if (!user) {
      if (typeof showToast === 'function') showToast('Código no reconocido. Prueba con correo o ID.', 'error', 'Registro');
      return;
    }
    await logAction(user.id, 'entry_registered', `Ingreso por ${source}`);
    if (typeof showToast === 'function') showToast(`Ingreso registrado: ${user.name}`, 'success', 'Registro');
    closeEntryModal();
  };

  const closeEntryModal = () => {
    try {
      if (scanTimer) { clearInterval(scanTimer); scanTimer = null; }
      if (qrStream) { qrStream.getTracks().forEach(t => t.stop()); qrStream = null; }
    } catch {}
    const overlay = document.querySelector('.entry-overlay');
    if (overlay) overlay.remove();
  };

  const openEntryModal = async () => {
    const overlay = document.createElement('div');
    overlay.className = 'entry-overlay';
    overlay.innerHTML = `
      <div class="entry-dialog">
        <div class="entry-header">
          <h3>Registrar ingreso</h3>
          <button class="entry-close" aria-label="Cerrar">&times;</button>
        </div>
        <div class="entry-tabs">
          <button class="tab-btn active" data-tab="qr">Escanear QR</button>
          <button class="tab-btn" data-tab="code">Ingresar código</button>
        </div>
        <div id="qr-section" class="entry-section">
          <video id="qr-video" autoplay playsinline class="qr-video"></video>
          <p id="qr-status" class="entry-hint">Apunta la cámara al código QR.</p>
        </div>
        <div id="code-section" class="entry-section hidden">
          <div class="entry-row">
            <input id="entry-code-input" type="text" placeholder="Código o correo" />
            <button id="entry-code-btn" class="btn">Registrar</button>
          </div>
          <p class="entry-hint">Acepta correo, formatos como uid:123 o UG-123.</p>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const closeBtn = overlay.querySelector('.entry-close');
    closeBtn.addEventListener('click', closeEntryModal);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeEntryModal(); });

    const tabBtns = overlay.querySelectorAll('.tab-btn');
    const qrSection = overlay.querySelector('#qr-section');
    const codeSection = overlay.querySelector('#code-section');
    tabBtns.forEach(btn => btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.getAttribute('data-tab');
      if (tab === 'qr') { qrSection.classList.remove('hidden'); codeSection.classList.add('hidden'); }
      else { codeSection.classList.remove('hidden'); qrSection.classList.add('hidden'); }
    }));

    const codeBtn = overlay.querySelector('#entry-code-btn');
    const codeInput = overlay.querySelector('#entry-code-input');
    codeBtn.addEventListener('click', () => processEntry(codeInput.value, 'manual'));

    const status = overlay.querySelector('#qr-status');
    const video = overlay.querySelector('#qr-video');
    try {
      if ('BarcodeDetector' in window) {
        detector = new window.BarcodeDetector({ formats: ['qr_code'] });
      }
      qrStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      video.srcObject = qrStream;
      await video.play();
      if (!detector) {
        status.textContent = 'Detector QR no soportado en este navegador. Usa el código.';
        return;
      }
      status.textContent = 'Escaneando...';
      scanTimer = setInterval(async () => {
        try {
          const codes = await detector.detect(video);
          if (codes && codes.length) {
            processEntry(codes[0].rawValue, 'qr');
          }
        } catch (err) {
          console.warn('Error detectando QR:', err);
        }
      }, 500);
    } catch (err) {
      status.textContent = 'No se pudo acceder a la cámara. Permisos o dispositivo.';
    }
  };

  const initEntryRegister = () => {
    const card = document.getElementById('kpi-register-entry');
    if (card) card.addEventListener('click', openEntryModal);
  };

  // Ratios adaptativos según ancho de ventana para evitar que "crezcan" al reducir
  const applyAdaptiveRatios = () => {
    const w = window.innerWidth;
    const lineRatio = w <= 480 ? 1.2 : (w <= 768 ? 1.6 : 2.0);
    // Unificar tamaños y hacerlos más pequeños en pantallas grandes
    const barRatio = w <= 480 ? 1.6 : (w <= 768 ? 2.0 : 2.4);
    const doughnutRatio = barRatio;
    if (salesChart) {
      salesChart.options.aspectRatio = lineRatio;
      salesChart.resize();
    }
    if (categoriesChart) {
      categoriesChart.options.aspectRatio = doughnutRatio;
      categoriesChart.resize();
    }
    if (dailyRegsChart) {
      dailyRegsChart.options.aspectRatio = barRatio;
      dailyRegsChart.resize();
    }
  };
  // Se aplicará tras inicializar gráficos
  window.addEventListener('resize', applyAdaptiveRatios);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      applyAdaptiveRatios();
    }
  });

  const initEstadisticasCharts = async () => {
    const usersCanvas = document.getElementById('users-stats-chart');
    const activityCanvas = document.getElementById('activity-stats-chart');
    if (!usersCanvas || !activityCanvas) return;
    const baseStats = await getUserStats();
    new Chart(usersCanvas.getContext('2d'), {
      type: 'bar',
      data: { labels: ['Visitantes','Estudiantes','Administradores'], datasets: [{ label: 'Usuarios', data: [baseStats.visitantes||0, baseStats.estudiantes||0, baseStats.admins||0], backgroundColor: ['#3498db','#2ecc71','#e74c3c'] }] },
      options: { responsive: true, maintainAspectRatio: true, aspectRatio: 1.6 }
    });
    new Chart(activityCanvas.getContext('2d'), {
      type: 'line',
      data: { labels: ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'], datasets: [{ label: 'Sesiones', data: [40,55,60,48,70,30,25], borderColor: '#33374c', tension: 0.4 }] },
      options: { responsive: true, maintainAspectRatio: true, aspectRatio: 1.8 }
    });
  };

  const initCalendarTasks = () => {
    const listEl = document.getElementById('tasks-list');
    const searchEl = document.getElementById('task-search');
    const filterBtns = Array.from(document.querySelectorAll('.segmented .seg-btn'));
    const detail = {
      title: document.getElementById('detail-title'),
      assignee: document.getElementById('detail-assignee'),
      due: document.getElementById('detail-due'),
      tags: document.getElementById('detail-tags'),
      comments: document.getElementById('detail-comments'),
      save: document.getElementById('detail-save'),
      del: document.getElementById('detail-delete'),
    };
    if (!listEl || !searchEl || filterBtns.length === 0) return;

    const STORAGE_KEY = 'adminCalendarTasksV2';
    const saveDB = (items) => localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    const loadDB = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; } };

    let tasks = loadDB();
    if (!tasks.length) {
      tasks = [
        { id: 1, title: 'Diseño de portada', status: 'todo', priority: 'high', assignee: 'Nai', due: new Date().toISOString().slice(0,10), tags: ['diseño'], comments: '' },
        { id: 2, title: 'Integrar API', status: 'in_progress', priority: 'medium', assignee: 'Von', due: new Date(Date.now()+86400000).toISOString().slice(0,10), tags: ['api'], comments: '' },
        { id: 3, title: 'Revisión UX', status: 'todo', priority: 'main', assignee: 'Ana', due: new Date(Date.now()+2*86400000).toISOString().slice(0,10), tags: ['ux'], comments: '' },
        { id: 4, title: 'Pruebas QA', status: 'todo', priority: 'low', assignee: 'Juan', due: new Date(Date.now()+3*86400000).toISOString().slice(0,10), tags: ['qa'], comments: '' },
      ];
      saveDB(tasks);
    }

    let currentFilter = 'todo';
    let query = '';
    let selectedId = tasks[0]?.id || null;

    const badgeClass = (p) => {
      if (p === 'high') return 'status-badge high';
      if (p === 'medium') return 'status-badge medium';
      if (p === 'low') return 'status-badge low';
      return 'status-badge main';
    };

    const labelPrioridad = (p) => {
      if (p === 'high') return 'Alta';
      if (p === 'medium') return 'Media';
      if (p === 'low') return 'Baja';
      return 'Principal';
    };

    const renderList = () => {
      const items = tasks
        .filter(t => t.status === currentFilter)
        .filter(t => t.title.toLowerCase().includes(query) || (t.assignee||'').toLowerCase().includes(query));
      listEl.classList.add('fade');
      listEl.innerHTML = items.map(t => `
        <div class="task-item ${t.id===selectedId?'selected':''}" data-id="${t.id}">
          <div class="task-left"><input type="checkbox" ${t.status==='in_progress'?'checked':''} disabled></div>
          <div class="task-main">
            <div class="task-title">${t.title}</div>
            <div class="task-meta">Vence ${t.due}</div>
          </div>
          <div class="task-right">
            <span class="${badgeClass(t.priority)}">${labelPrioridad(t.priority)}</span>
          </div>
        </div>
      `).join('');
      // After render, bind selection
      listEl.querySelectorAll('.task-item').forEach(el => {
        el.addEventListener('click', () => {
          selectedId = Number(el.getAttribute('data-id'));
          renderList();
          renderDetail();
        });
      });
      setTimeout(() => listEl.classList.remove('fade'), 160);
    };

    const renderDetail = () => {
      const t = tasks.find(x => x.id === selectedId);
      if (!t) return;
      const panel = document.querySelector('.task-detail');
      if (panel) { panel.classList.add('fade'); setTimeout(() => panel.classList.remove('fade'), 160); }
      detail.title.value = t.title || '';
      detail.assignee.value = t.assignee || '';
      detail.due.value = t.due || '';
      detail.tags.value = (t.tags||[]).join(', ');
      detail.comments.value = t.comments || '';
    };

    filterBtns.forEach(btn => btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.getAttribute('data-filter');
      renderList();
    }));

    searchEl.addEventListener('input', (e) => {
      query = (e.target.value || '').toLowerCase().trim();
      renderList();
    });

    detail.save.addEventListener('click', async () => {
      const idx = tasks.findIndex(x => x.id === selectedId);
      if (idx < 0) return;
      tasks[idx] = {
        ...tasks[idx],
        title: detail.title.value.trim(),
        assignee: detail.assignee.value.trim(),
        due: detail.due.value,
        tags: detail.tags.value.split(',').map(s => s.trim()).filter(Boolean),
        comments: detail.comments.value.trim(),
      };
      saveDB(tasks);
      renderList();
      if (typeof showToast === 'function') showToast('Tarea guardada', 'success');
      if (currentUser && currentUser.id) await logAction(currentUser.id, 'task_saved', `Calendario: ${tasks[idx].title}`);
    });

    detail.del.addEventListener('click', async () => {
      const idx = tasks.findIndex(x => x.id === selectedId);
      if (idx < 0) return;
      const removed = tasks.splice(idx,1)[0];
      saveDB(tasks);
      selectedId = tasks[0]?.id || null;
      renderList();
      renderDetail();
      if (typeof showToast === 'function') showToast('Tarea eliminada', 'warning');
      if (currentUser && currentUser.id) await logAction(currentUser.id, 'task_deleted', `Calendario: ${removed?.title||''}`);
    });

    renderList();
    renderDetail();
  };

  // --- Gestión de Usuarios: ver y editar ---
  const initUsuariosAdmin = () => {
    const tbody = document.getElementById('users-table-body');
    const searchEl = document.getElementById('user-search');
    const filtersWrap = document.getElementById('students-filters');
    const usersTableEl = document.querySelector('.users-table');
    const usersTableWrapEl = document.querySelector('.users-table-wrap');
    const filterCareerEl = document.getElementById('students-filter-career');
    const filterSemesterEl = document.getElementById('students-filter-semester');
    const filterStatusEl = document.getElementById('students-filter-status');
    const roleTabs = document.querySelectorAll('.role-tab');
    const modal = document.getElementById('user-edit-modal');
    const closeBtn = document.getElementById('user-edit-close');
    const saveBtn = document.getElementById('user-edit-save');
    const deleteBtn = document.getElementById('user-edit-delete');
    const errEl = document.getElementById('user-edit-error');
    const idEl = document.getElementById('edit-user-id');
    const nameEl = document.getElementById('edit-user-name');
    const emailEl = document.getElementById('edit-user-email');
    const roleEl = document.getElementById('edit-user-role');
    const statusEl = document.getElementById('edit-user-status');
    const passEl = document.getElementById('edit-user-password');
    const careerEl = document.getElementById('edit-user-career');
    const semesterEl = document.getElementById('edit-user-semester');
    const studentFields = document.getElementById('student-fields');
    const visitorFields = document.getElementById('visitor-fields');
    const visitReasonEl = document.getElementById('edit-user-visit-reason');
    const addBtn = document.getElementById('user-add-btn');
    const titleEl = document.getElementById('user-edit-title');
    const adminCodeEl = document.getElementById('edit-user-admin-code');
    const adminFieldsEl = document.getElementById('admin-fields');

    let isCreating = false;

    // Lista fija de carreras y normalización para coincidir valores guardados
    const fixedCareers = [
      'Administración de Empresas',
      'Contaduría Pública',
      'Trabajo social',
      'Ingeniería en sistemas',
      'Licenciatura infantil',
      'Sin carrera'
    ];
    const normalize = (s) => (s||'')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
    const careerCanonicalMap = {
      'administracion de empresas': 'Administración de Empresas',
      'contaduria publica': 'Contaduría Pública',
      'trabajo social': 'Trabajo social',
      'ingenieria en sistemas': 'Ingeniería en sistemas',
      'licenciatura infantil': 'Licenciatura infantil',
      'sin carrera': 'Sin carrera'
    };
    const canonicalizeCareer = (s) => careerCanonicalMap[normalize(s)] || null;

    if (!tbody || !modal) return;

    let usersCache = [];
    let query = '';
    let roleFilter = 'estudiante';
    let fCareer = '';
    let fSemester = '';
    let fStatus = '';

    const roleLabel = (r) => {
      if (r === 'admin') return 'Administrador';
      if (r === 'estudiante') return 'Estudiante';
      if (r === 'visitante') return 'Visitante';
      return r || '';
    };

    const openModal = (u) => {
      errEl.textContent = '';
      isCreating = false;
      if (titleEl) titleEl.textContent = 'Editar usuario';
      if (deleteBtn) deleteBtn.style.display = 'inline-block';
      idEl.value = u.id;
      nameEl.value = u.name || '';
      emailEl.value = u.email || '';
      roleEl.value = u.role || 'visitante';
      statusEl.value = u.status || 'activo';
      passEl.value = '';
      if (adminCodeEl) adminCodeEl.value = '';
      const canonCareer = canonicalizeCareer(u.career || '') || (u.career ? '' : 'Sin carrera');
      careerEl.value = fixedCareers.includes(canonCareer) ? canonCareer : '';
      const sem = (u.semester||'').toString().trim();
      if (Array.from(semesterEl.options).some(opt => opt.value === sem)) semesterEl.value = sem; else semesterEl.value = '';
      studentFields.style.display = roleEl.value === 'estudiante' ? 'grid' : 'none';
      if (visitReasonEl) visitReasonEl.value = (u.visitReason || '').trim();
      if (visitorFields) visitorFields.style.display = roleEl.value === 'visitante' ? 'grid' : 'none';
      if (adminFieldsEl) adminFieldsEl.style.display = 'none';
      modal.classList.remove('hidden');
    };

    const closeModal = () => {
      modal.classList.add('hidden');
    };

    const refreshFilterOptions = () => {
      // Opciones fijas para carreras según la paleta del gráfico
      const careers = [
        'Administración de Empresas',
        'Contaduría Pública',
        'Trabajo social',
        'Ingeniería en sistemas',
        'Licenciatura infantil',
        'Sin carrera'
      ];
      // Semestres derivados de datos actuales (si existen) y ordenados
      const sUsers = (usersCache||[]).filter(u => (u.role||'') === 'estudiante');
      const semesters = Array.from(new Set(sUsers.map(u => (u.semester||'').trim()).filter(Boolean))).sort((a,b)=>{
        const na = Number(a); const nb = Number(b);
        if (!isNaN(na) && !isNaN(nb)) return na-nb; return a.localeCompare(b);
      });
      if (filterCareerEl) {
        const prev = fCareer;
        filterCareerEl.innerHTML = '<option value="">Todas las carreras</option>' + careers.map(c => `<option value="${c}">${c}</option>`).join('');
        // Mantener selección si existe
        if (prev && careers.includes(prev)) filterCareerEl.value = prev; else filterCareerEl.value = '';
      }
      if (filterSemesterEl) {
        const prev = fSemester;
        filterSemesterEl.innerHTML = '<option value="">Todos los semestres</option>' + semesters.map(s => `<option value="${s}">${s}</option>`).join('');
        if (prev && semesters.includes(prev)) filterSemesterEl.value = prev; else filterSemesterEl.value = '';
      }
      if (filterStatusEl) {
        const allowed = ['', 'activo', 'inactivo'];
        if (!allowed.includes(fStatus)) fStatus = '';
        filterStatusEl.value = fStatus;
      }
    };

    const renderTable = async () => {
      usersCache = await listUsers();
      // Actualizar opciones de filtros cuando estemos en estudiantes
      refreshFilterOptions();
      // Actualizar encabezado según el rol seleccionado
      const thead = document.getElementById('users-table-head');
      if (thead) {
        if (roleFilter === 'estudiante') {
          thead.innerHTML = `
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Carrera</th>
              <th>Semestre</th>
              <th style="width:140px">Acciones</th>
            </tr>`;
        } else if (roleFilter === 'visitante') {
          thead.innerHTML = `
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Motivo de la visita</th>
              <th style="width:140px">Acciones</th>
            </tr>`;
        } else {
          // Administradores
          thead.innerHTML = `
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Estado</th>
              <th style="width:140px">Acciones</th>
            </tr>`;
        }
      }
      // Alternar clases por rol para permitir ajustes de estilo específicos
      if (usersTableEl) {
        usersTableEl.classList.toggle('students-view', roleFilter === 'estudiante');
        usersTableEl.classList.toggle('visitors-view', roleFilter === 'visitante');
        usersTableEl.classList.toggle('admins-view', roleFilter === 'admin');
      }
      const filtered = (usersCache || []).filter(u => {
        const t = query.toLowerCase();
        const matchesQuery = (u.name||'').toLowerCase().includes(t) || (u.email||'').toLowerCase().includes(t);
        const matchesRole = roleFilter ? ((u.role||'') === roleFilter) : true;
        const matchesStatus = !fStatus || ((u.status||'') === fStatus);
        let matchesCareer = true, matchesSemester = true;
        if (roleFilter === 'estudiante') {
          const careerVal = (u.career||'').trim() || 'Sin carrera';
          const semesterVal = (u.semester||'').trim();
          matchesCareer = !fCareer || (careerVal === fCareer);
          matchesSemester = !fSemester || (semesterVal === fSemester);
        }
        return matchesQuery && matchesRole && matchesStatus && matchesCareer && matchesSemester;
      });
      // Si estamos en visitantes, obtener últimos motivos de reserva
      let reasonByUser = {};
      if (roleFilter === 'visitante') {
        await Promise.all(filtered.map(async (u) => {
          try {
            const arr = await listReservas(u.id);
            arr.sort((a,b) => new Date(b.date) - new Date(a.date));
            reasonByUser[u.id] = (arr[0]?.motivo || '').trim();
          } catch (_) {
            reasonByUser[u.id] = '';
          }
        }));
      }

      tbody.innerHTML = filtered.map(u => {
        const statusCls = ((u.status||'').toLowerCase() === 'activo') ? 'chip--status-active' : 'chip--status-inactive';
        if (roleFilter === 'estudiante') {
          return `
            <tr data-id="${u.id}">
              <td>${u.name||''}</td>
              <td>${u.email||''}</td>
              <td>${roleLabel(u.role)}</td>
              <td><span class="chip ${statusCls}">${u.status||''}</span></td>
              <td><span class="chip chip--career">${(u.career||'Sin carrera')}</span></td>
              <td><span class="chip chip--semester">${(u.semester||'')}</span></td>
              <td>
                <button class="btn btn-sm user-edit">Editar</button>
                <button class="btn btn-danger btn-sm user-delete">Eliminar</button>
              </td>
            </tr>`;
        } else if (roleFilter === 'visitante') {
          const motivo = ((u.visitReason || reasonByUser[u.id] || '')).trim() || '—';
          return `
            <tr data-id="${u.id}">
              <td>${u.name||''}</td>
              <td>${u.email||''}</td>
              <td>${roleLabel(u.role)}</td>
              <td><span class="chip ${statusCls}">${u.status||''}</span></td>
              <td><span class="chip chip--reason">${motivo}</span></td>
              <td>
                <button class="btn btn-sm user-edit">Editar</button>
                <button class="btn btn-danger btn-sm user-delete">Eliminar</button>
              </td>
            </tr>`;
        } else {
          // Administradores
          return `
            <tr data-id="${u.id}">
              <td>${u.name||''}</td>
              <td>${u.email||''}</td>
              <td>${roleLabel(u.role)}</td>
              <td><span class="chip ${statusCls}">${u.status||''}</span></td>
              <td>
                <button class="btn btn-sm user-edit">Editar</button>
                <button class="btn btn-danger btn-sm user-delete">Eliminar</button>
              </td>
            </tr>`;
        }
      }).join('');

      // Bind eventos por fila
      tbody.querySelectorAll('.user-edit').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const tr = e.target.closest('tr');
          const id = Number(tr.getAttribute('data-id'));
          const user = usersCache.find(x => x.id === id) || await getUserById(id);
          if (user) openModal(user);
        });
      });

      tbody.querySelectorAll('.user-delete').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const tr = e.target.closest('tr');
          const id = Number(tr.getAttribute('data-id'));
          if (!id) return;
          if (!confirm('¿Eliminar este usuario?')) return;
          try {
            await deleteUser(id);
            if (typeof showToast === 'function') showToast('Usuario eliminado', 'warning');
            renderTable();
          } catch (err) {
            if (typeof showToast === 'function') showToast('Error al eliminar: '+err.message, 'error');
          }
        });
      });
    };

    // Guardar cambios (creación o edición)
    const saveChanges = async () => {
      errEl.textContent = '';
      const id = Number(idEl.value);
      const name = nameEl.value.trim();
      const email = emailEl.value.trim().toLowerCase();
      const role = roleEl.value;
      const status = statusEl.value;
      const password = passEl.value;
      const career = careerEl.value.trim();
      const semester = semesterEl.value.trim();
      const visitReason = visitReasonEl ? visitReasonEl.value.trim() : '';
      const adminCode = adminCodeEl ? adminCodeEl.value.trim() : '';
      if (!name || !email || !role) {
        errEl.textContent = 'Completa nombre, correo y rol.';
        return;
      }

      // Validar correo único
      const existing = await getUserByEmail(email);
      if (existing && existing.id !== id) {
        errEl.textContent = 'Ese correo ya está registrado por otro usuario.';
        return;
      }

      if (!isCreating) {
        const update = { name, email, role, status };
        if (password) update.password = password; // se hashea en updateUser
        if (role === 'estudiante') { update.career = career; update.semester = semester; }
        else { update.career = ''; update.semester = ''; }
        if (role === 'visitante') { update.visitReason = visitReason; } else { update.visitReason = ''; }
        try {
          await updateUser(id, update);
          if (typeof showToast === 'function') showToast('Usuario actualizado', 'success');
          closeModal();
          renderTable();
        } catch (err) {
          errEl.textContent = 'Error al guardar: ' + (err.message || err);
        }
        return;
      }

      // Creación de usuario
      if (!password) {
        errEl.textContent = 'Para crear un usuario, ingresa una contraseña.';
        return;
      }
      try {
        const newId = await registerUser({ name, email, password, role, adminCode, career: role==='estudiante'?career:'', semester: role==='estudiante'?semester:'', status });
        if (role === 'visitante' && visitReason) {
          await updateUser(newId, { visitReason });
        }
        if (typeof showToast === 'function') showToast('Usuario creado', 'success');
        closeModal();
        renderTable();
      } catch (err) {
        errEl.textContent = 'Error al crear: ' + (err.message || err);
      }
    };

    // Eventos UI
    roleEl.addEventListener('change', () => {
      studentFields.style.display = roleEl.value === 'estudiante' ? 'grid' : 'none';
      if (visitorFields) visitorFields.style.display = roleEl.value === 'visitante' ? 'grid' : 'none';
      if (adminFieldsEl) adminFieldsEl.style.display = (isCreating && roleEl.value === 'admin') ? 'grid' : 'none';
    });
    saveBtn.addEventListener('click', saveChanges);
    deleteBtn.addEventListener('click', async () => {
      const id = Number(idEl.value);
      if (!id) return;
      if (!confirm('¿Eliminar este usuario?')) return;
      try {
        await deleteUser(id);
        if (typeof showToast === 'function') showToast('Usuario eliminado', 'warning');
        closeModal();
        renderTable();
      } catch (err) {
        errEl.textContent = 'Error al eliminar: ' + (err.message || err);
      }
    });
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    // Añadir nuevo usuario
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        errEl.textContent = '';
        isCreating = true;
        if (titleEl) titleEl.textContent = 'Añadir usuario';
        if (deleteBtn) deleteBtn.style.display = 'none';
        idEl.value = '';
        nameEl.value = '';
        emailEl.value = '';
        roleEl.value = (roleFilter || 'visitante');
        statusEl.value = 'activo';
        passEl.value = '';
        if (adminCodeEl) adminCodeEl.value = '';
        careerEl.value = '';
        semesterEl.value = '';
        if (visitReasonEl) visitReasonEl.value = '';
        studentFields.style.display = roleEl.value === 'estudiante' ? 'grid' : 'none';
        if (visitorFields) visitorFields.style.display = roleEl.value === 'visitante' ? 'grid' : 'none';
        if (adminFieldsEl) adminFieldsEl.style.display = (roleEl.value === 'admin') ? 'grid' : 'none';
        modal.classList.remove('hidden');
      });
    }

    if (searchEl) {
      searchEl.addEventListener('input', (e) => { query = (e.target.value||'').trim(); renderTable(); });
    }

    // Tabs por rol: Estudiantes / Visitantes / Administradores (inicio en Estudiantes)
    if (roleTabs && roleTabs.length) {
      roleTabs.forEach(tab => {
        tab.addEventListener('click', () => {
          roleTabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          roleFilter = tab.getAttribute('data-role');
          // Mostrar/ocultar filtros de estudiantes
          if (filtersWrap) filtersWrap.style.display = roleFilter === 'estudiante' ? 'flex' : 'none';
          renderTable();
        });
      });
    }

    // Eventos de filtros
    if (filterCareerEl) filterCareerEl.addEventListener('change', (e) => { fCareer = e.target.value; renderTable(); });
    if (filterSemesterEl) filterSemesterEl.addEventListener('change', (e) => { fSemester = e.target.value; renderTable(); });
    if (filterStatusEl) filterStatusEl.addEventListener('change', (e) => { fStatus = e.target.value; renderTable(); });

    // Estado inicial de visibilidad
    if (filtersWrap) filtersWrap.style.display = 'flex';
    // Estado inicial de clase de tabla (rol por defecto: estudiantes)
    if (usersTableEl) usersTableEl.classList.add('students-view');

    renderTable();
  };

  let firstRender = true;
  const renderSection = (key) => {
    const tplFn = templates[key] || templates.inicio;
    const swap = () => {
      sectionArea.innerHTML = tplFn();
      localStorage.setItem('adminLastSection', key);
      setActive(key);
      if (key === 'inicio') { initInicioCharts(); initInicioData(); applyAdaptiveRatios(); initEntryRegister(); } else { salesChart = null; categoriesChart = null; dailyRegsChart = null; }
      if (key === 'estadisticas') initEstadisticasCharts();
      if (key === 'reportes') initSystemLogs();
      if (key === 'calendario') initCalendarTasks();
      if (key === 'usuarios') initUsuariosAdmin();
    };
    if (firstRender) {
      swap();
      firstRender = false;
      return;
    }
    sectionArea.classList.add('view-exit');
    setTimeout(() => {
      swap();
      sectionArea.classList.remove('view-exit');
      sectionArea.classList.add('view-enter');
      setTimeout(() => sectionArea.classList.remove('view-enter'), 240);
    }, 200);
  };

  const initialSection = localStorage.getItem('adminLastSection') || 'inicio';
  renderSection(initialSection);
  navItems.forEach(item => item.addEventListener('click', (e) => { e.preventDefault(); renderSection(item.getAttribute('data-section')); }));

  // Sidebar toggle: expand/collapse while remaining fixed
  const sidebar = document.querySelector('.sidebar');
  const toggleBtn = document.querySelector('.sidebar-toggle');
  if (sidebar && toggleBtn) {
    const handleToggle = () => {
      if (window.innerWidth <= 768) {
        sidebar.classList.toggle('menu-open');
      } else {
        sidebar.classList.toggle('expanded');
      }
    };
    toggleBtn.addEventListener('click', handleToggle);

    // Cerrar menú móvil al seleccionar una opción
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
      item.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          sidebar.classList.remove('menu-open');
        }
      });
    });

    // Mantener estados limpios al redimensionar
    window.addEventListener('resize', () => {
      if (window.innerWidth <= 768) {
        sidebar.classList.remove('expanded');
      } else {
        sidebar.classList.remove('menu-open');
      }
    });
  }

  // Theme toggle: claro/oscuro con persistencia en localStorage
  const themeToggle = document.querySelector('.theme-toggle');
  if (themeToggle) {
    const themeIcon = themeToggle.querySelector('i');
    const themeLabel = themeToggle.querySelector('.nav-label');

    const getTheme = () => {
      return localStorage.getItem('theme') || document.documentElement.getAttribute('data-theme') || 'light';
    };
    const setTheme = (theme) => {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
      if (theme === 'dark') {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
        if (themeLabel) themeLabel.textContent = 'Modo claro';
      } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
        if (themeLabel) themeLabel.textContent = 'Modo oscuro';
      }
    };

    // Inicializa con el tema guardado o actual
    setTheme(getTheme());

    themeToggle.addEventListener('click', () => {
      const current = getTheme();
      const next = current === 'dark' ? 'light' : 'dark';
      setTheme(next);
    });
  }

  // Logout del dashboard: limpiar usuario y navegar a login
  const logoutBtn = document.getElementById('logout-dashboard');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      try {
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('currentUser');
      } catch (e) {}
      if (typeof showToast === 'function') {
        showToast('Sesión cerrada.', 'success');
      }
      if (typeof navigate === 'function') {
        navigate('login');
      } else {
        location.hash = '#/login';
      }
    });
  }
}
  // --- Logs del sistema en "Novedades" ---
  const initSystemLogs = async () => {
    const listEl = document.getElementById('logs-list');
    const sumEl = document.getElementById('logs-summary');
    const searchEl = document.getElementById('logs-search');
    const catEl = document.getElementById('logs-category');
    const sevEl = document.getElementById('logs-severity');
    const startEl = document.getElementById('logs-start');
    const endEl = document.getElementById('logs-end');
    const clearBtn = document.getElementById('logs-clear');
    if (!listEl || !searchEl || !catEl || !sevEl) return;

    // Obtener logs desde la base de datos
    let baseLogs = await getLogs({ limit: 200 });

    // Derivar categoría y severidad desde la acción
    const deriveCategory = (a) => {
      if (!a) return 'sistema';
      if (a.includes('login') || a.includes('session')) return 'auth';
      if (a.includes('user')) return 'usuarios';
      if (a.includes('task')) return 'tareas';
      return 'sistema';
    };
    const deriveSeverity = (a) => {
      if (!a) return 'info';
      if (a.includes('deleted') || a.includes('reset')) return 'warn';
      if (a.includes('error')) return 'error';
      return 'info';
    };

    baseLogs = (baseLogs || []).map(l => ({
      ...l,
      category: deriveCategory(String(l.action||'')),
      severity: deriveSeverity(String(l.action||'')),
    }));

    const fmtDate = (iso) => {
      try {
        const d = new Date(iso);
        return d.toLocaleString('es-ES', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
      } catch { return iso; }
    };

    const sevBadge = (sev) => {
      if (sev === 'error') return '<span class="sev-badge sev-error">Error</span>';
      if (sev === 'warn') return '<span class="sev-badge sev-warn">Advertencia</span>';
      return '<span class="sev-badge sev-info">Info</span>';
    };

    let query = '';
    let category = '';
    let severity = '';
    let startDate = '';
    let endDate = '';

    const render = () => {
      const q = query.toLowerCase();
      const sTs = startDate ? new Date(startDate).getTime() : null;
      const eTs = endDate ? new Date(endDate).getTime() : null;
      const filtered = baseLogs.filter(l => {
        const t = new Date(l.timestamp).getTime();
        if (category && l.category !== category) return false;
        if (severity && l.severity !== severity) return false;
        if (sTs && t < sTs) return false;
        if (eTs && t > eTs + 86400000 - 1) return false; // incluir día completo
        const msg = `${l.action} ${l.details||''}`.toLowerCase();
        return !q || msg.includes(q);
      });

      listEl.classList.add('fade');
      listEl.innerHTML = filtered.map(l => `
        <li class="log-item ${l.severity}">
          <div class="log-top">
            <span class="log-time">${fmtDate(l.timestamp)}</span>
            <span class="log-cat">${l.category}</span>
            ${sevBadge(l.severity)}
          </div>
          <div class="log-msg">${l.details ? l.details : l.action}</div>
          ${l.userId ? `<div class="log-meta">usuario: #${l.userId}</div>` : ''}
        </li>
      `).join('');
      sumEl.innerHTML = `${filtered.length} eventos mostrados`;
      setTimeout(() => listEl.classList.remove('fade'), 140);
    };

    // Bind filtros
    searchEl.addEventListener('input', (e) => { query = (e.target.value||'').trim(); render(); });
    catEl.addEventListener('change', (e) => { category = e.target.value; render(); });
    sevEl.addEventListener('change', (e) => { severity = e.target.value; render(); });
    startEl.addEventListener('change', (e) => { startDate = e.target.value; render(); });
    endEl.addEventListener('change', (e) => { endDate = e.target.value; render(); });
    if (clearBtn) clearBtn.addEventListener('click', () => {
      searchEl.value = '';
      catEl.value = '';
      sevEl.value = '';
      startEl.value = '';
      endEl.value = '';
      query = category = severity = '';
      startDate = endDate = '';
      render();
    });

    render();
  };