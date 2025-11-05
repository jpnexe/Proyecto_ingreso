import { db, logAction } from '../js/db.js';

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
            <div class="notifications">
              <i class="fas fa-bell"></i>
              <span class="notification-badge">2</span>
            </div>
            <div class="user-profile">
              <span class="user-name">Renee McKelvey</span>
              <span class="user-role">Product Manager</span>
              <img src="https://i.pravatar.cc/40" alt="User Avatar" class="user-avatar">
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
            <div class="kpi-header">
              <span>Total Sales</span>
              <i class="fas fa-shopping-bag"></i>
            </div>
            <div class="kpi-value">21 324</div>
            <div class="kpi-change positive">+2 031</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-header">
              <span>Total Income</span>
              <i class="fas fa-dollar-sign"></i>
            </div>
            <div class="kpi-value">$221,324.50</div>
            <div class="kpi-change negative">-$2,201</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-header">
              <span>Total Sessions</span>
              <i class="fas fa-users"></i>
            </div>
            <div class="kpi-value">16 703</div>
            <div class="kpi-change positive">+3 392</div>
          </div>
          <div class="kpi-card clickable" id="kpi-register-entry">
            <div class="kpi-header">
              <span>Registrar ingreso</span>
              <i class="fas fa-qrcode"></i>
            </div>
            <div class="kpi-value">QR / Código</div>
            <div class="kpi-change positive">Nuevo</div>
          </div>
          </section>
          <section class="charts-grid">
          <div class="chart-card">
            <div class="chart-header">
              <h3>Sales Performance</h3>
              <button class="chart-settings"><i class="fas fa-cog"></i></button>
            </div>
            <canvas id="sales-performance-chart"></canvas>
          </div>
          <div class="chart-card">
            <div class="chart-header">
              <h3>Popular Categories</h3>
              <button class="chart-settings"><i class="fas fa-cog"></i></button>
            </div>
            <canvas id="popular-categories-chart"></canvas>
          </div>
          </section>
          <section class="recent-customers">
          <div class="recent-customers-header">
            <h3>Recent Customers</h3>
            <button class="chart-settings"><i class="fas fa-cog"></i></button>
          </div>
                    <div class="recent-customers-table">
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><img src="https://i.pravatar.cc/40?img=1" alt="Avatar"></td>
                  <td>John Doe</td>
                  <td>john.doe@example.com</td>
                  <td>$1,250.00</td>
                </tr>
                <tr>
                  <td><img src="https://i.pravatar.cc/40?img=2" alt="Avatar"></td>
                  <td>Jane Smith</td>
                  <td>jane.smith@example.com</td>
                  <td>$890.50</td>
                </tr>
                <tr>
                  <td><img src="https://i.pravatar.cc/40?img=3" alt="Avatar"></td>
                  <td>Sam Wilson</td>
                  <td>sam.wilson@example.com</td>
                  <td>$2,400.00</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="view-all-container">
            <a href="#" class="view-all-btn">View All</a>
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

  const templates = {
    inicio: () => `
      <section class="kpi-grid">
        <div class="kpi-card dark"><div class="kpi-header"><span>Total Sales</span><i class="fas fa-shopping-bag"></i></div><div class="kpi-value">21 324</div><div class="kpi-change positive">+2 031</div></div>
        <div class="kpi-card"><div class="kpi-header"><span>Total Income</span><i class="fas fa-dollar-sign"></i></div><div class="kpi-value">$221,324.50</div><div class="kpi-change negative">-$2,201</div></div>
        <div class="kpi-card"><div class="kpi-header"><span>Total Sessions</span><i class="fas fa-users"></i></div><div class="kpi-value">16 703</div><div class="kpi-change positive">+3 392</div></div>
        <div class="kpi-card clickable" id="kpi-register-entry"><div class="kpi-header"><span>Registrar ingreso</span><i class="fas fa-qrcode"></i></div><div class="kpi-value">QR / Código</div><div class="kpi-change positive">Nuevo</div></div>
      </section>
      <section class="charts-grid">
        <div class="chart-card"><div class="chart-header"><h3>Sales Performance</h3><button class="chart-settings"><i class="fas fa-cog"></i></button></div><canvas id="sales-performance-chart"></canvas></div>
        <div class="chart-card"><div class="chart-header"><h3>Popular Categories</h3><button class="chart-settings"><i class="fas fa-cog"></i></button></div><canvas id="popular-categories-chart"></canvas></div>
      </section>
      <section class="recent-customers">
        <div class="recent-customers-header"><h3>Recent Customers</h3><button class="chart-settings"><i class="fas fa-cog"></i></button></div>
        <div class="recent-customers-table">
          <table>
            <thead><tr><th></th><th>Name</th><th>Email</th><th>Amount</th></tr></thead>
            <tbody>
              <tr><td><img src="https://i.pravatar.cc/40?img=1" alt="Avatar"></td><td>John Doe</td><td>john.doe@example.com</td><td>$1,250.00</td></tr>
              <tr><td><img src="https://i.pravatar.cc/40?img=2" alt="Avatar"></td><td>Jane Smith</td><td>jane.smith@example.com</td><td>$890.50</td></tr>
              <tr><td><img src="https://i.pravatar.cc/40?img=3" alt="Avatar"></td><td>Sam Wilson</td><td>sam.wilson@example.com</td><td>$2,400.00</td></tr>
            </tbody>
          </table>
        </div>
        <div class="view-all-container"><a href="#" class="view-all-btn">View All</a></div>
      </section>
    `,
    reportes: () => `
      <section class="reports-section chart-card">
        <div class="chart-header"><h3>Novedades del sistema</h3></div>
        <ul>
          <li>Actualización de seguridad aplicada (v1.2.3).</li>
          <li>Nuevo módulo de estadísticas integrado.</li>
          <li>Mejoras de rendimiento en el panel.</li>
          <li>Correcciones de UI en móviles.</li>
        </ul>
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
        <div class="chart-header"><h3>Configuración de roles</h3></div>
        <div class="roles-grid">
          <div>
            <h4>Visitantes</h4>
            <label><input type="checkbox" id="visitors-allow-register"> Permitir registro</label>
          </div>
          <div>
            <h4>Estudiantes</h4>
            <label><input type="checkbox" id="students-allow-messages"> Permitir mensajes</label>
          </div>
          <div>
            <h4>Administradores</h4>
            <label><input type="checkbox" id="admins-allow-reports"> Permitir reportes extendidos</label>
          </div>
        </div>
        <button id="save-user-config" class="btn">Guardar configuración</button>
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

  const initInicioCharts = () => {
    const salesCanvas = document.getElementById('sales-performance-chart');
    const categoriesCanvas = document.getElementById('popular-categories-chart');
    if (!salesCanvas || !categoriesCanvas) return;
    const salesCtx = salesCanvas.getContext('2d');
    salesChart = new Chart(salesCtx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
        datasets: [
          { label: 'Laptops', data: [65,59,80,81,56], borderColor: '#33374c', tension: 0.4, fill: false },
          { label: 'Headsets', data: [28,48,40,19,86], borderColor: '#a0a0a0', tension: 0.4, fill: false },
          { label: 'Monitors', data: [18,58,30,69,26], borderColor: '#c0c0c0', tension: 0.4, fill: false },
          { label: 'Phones', data: [38,28,60,59,76], borderColor: '#e0e0e0', tension: 0.4, fill: false },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2.0,
        resizeDelay: 150,
        plugins: { legend: { position: 'top', align: 'start' } },
        scales: { y: { beginAtZero: true } },
      },
    });

    const categoriesCtx = categoriesCanvas.getContext('2d');
    categoriesChart = new Chart(categoriesCtx, {
      type: 'doughnut',
      data: {
        labels: ['Electronics', 'Furniture', 'Toys'],
        datasets: [{ label: 'Popular Categories', data: [300,150,100], backgroundColor: ['#33374c','#a0a0a0','#e0e0e0'], borderWidth: 0 }]
      },
      options: { responsive: true, maintainAspectRatio: true, aspectRatio: 1.2, resizeDelay: 150, plugins: { legend: { position: 'bottom' } } }
    });
  };

  // --- Registro de ingreso (QR / Código) ---
  let qrStream = null;
  let scanTimer = null;
  let detector = null;

  const findUserByCode = async (raw) => {
    const code = String(raw || '').trim().toLowerCase();
    if (!code) return null;
    let user = await db.users.where('email').equals(code).first();
    if (user) return user;
    const m = code.match(/(?:uid:|ug-)(\d+)/);
    if (m) {
      user = await db.users.get(Number(m[1]));
      if (user) return user;
    }
    const arr = await db.users.filter(u => (u.userCode || '').toLowerCase() === code).toArray();
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
    const doughnutRatio = w <= 480 ? 1.0 : (w <= 768 ? 1.1 : 1.2);
    if (salesChart) {
      salesChart.options.aspectRatio = lineRatio;
      salesChart.resize();
    }
    if (categoriesChart) {
      categoriesChart.options.aspectRatio = doughnutRatio;
      categoriesChart.resize();
    }
  };
  // Se aplicará tras inicializar gráficos
  window.addEventListener('resize', applyAdaptiveRatios);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      applyAdaptiveRatios();
    }
  });

  const initEstadisticasCharts = () => {
    const usersCanvas = document.getElementById('users-stats-chart');
    const activityCanvas = document.getElementById('activity-stats-chart');
    if (!usersCanvas || !activityCanvas) return;
    new Chart(usersCanvas.getContext('2d'), {
      type: 'bar',
      data: { labels: ['Visitantes','Estudiantes','Admins'], datasets: [{ label: 'Activos', data: [120,340,12], backgroundColor: ['#3498db','#2ecc71','#e74c3c'] }] },
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

  let firstRender = true;
  const renderSection = (key) => {
    const tplFn = templates[key] || templates.inicio;
    const swap = () => {
      sectionArea.innerHTML = tplFn();
      localStorage.setItem('adminLastSection', key);
      setActive(key);
      if (key === 'inicio') { initInicioCharts(); applyAdaptiveRatios(); initEntryRegister(); } else { salesChart = null; categoriesChart = null; }
      if (key === 'estadisticas') initEstadisticasCharts();
      if (key === 'calendario') initCalendarTasks();
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