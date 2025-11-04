import { getUserStats, listUsers, updateUser, listReservas, createReserva } from '../js/db.js';

export function render({ currentUser }) {
  return `
    <div class="admin-dashboard-layout">
      <!-- Barra Lateral Moderna -->
      <aside class="modern-sidebar">
        <!-- Logo y Título -->
        <div class="sidebar-header">
          <div class="sidebar-logo">
            <div class="logo-icon">📊</div>
            <div class="logo-text">
              <h2>Panel de Administración</h2>
            </div>
          </div>
        </div>

        <!-- Navegación Principal -->
        <nav class="sidebar-nav">
          <div class="nav-section">
            <div class="nav-section-title">PRINCIPAL</div>
            <ul class="nav-list">
              <li class="nav-item">
                <a href="#" class="nav-link active" data-view="dashboard">
                  <span class="nav-icon">📊</span>
                  <span class="nav-text">Dashboard</span>
                </a>
              </li>
              <li class="nav-item">
                <a href="#" class="nav-link" data-view="analytics">
                  <span class="nav-icon">📈</span>
                  <span class="nav-text">Analytics</span>
                </a>
              </li>
            </ul>
          </div>

          <div class="nav-section">
            <div class="nav-section-title">GESTIÓN</div>
            <ul class="nav-list">
              <li class="nav-item">
                <a href="#" class="nav-link" data-view="students">
                  <span class="nav-icon">👨‍🎓</span>
                  <span class="nav-text">Estudiantes</span>
                  <span class="nav-badge" id="students-count">0</span>
                </a>
              </li>
              <li class="nav-item">
                <a href="#" class="nav-link" data-view="visitors">
                  <span class="nav-icon">🚶‍♂️</span>
                  <span class="nav-text">Visitantes</span>
                  <span class="nav-badge" id="visitors-count">0</span>
                </a>
              </li>
              <li class="nav-item">
                <a href="#" class="nav-link" data-view="admins">
                  <span class="nav-icon">👑</span>
                  <span class="nav-text">Administradores</span>
                  <span class="nav-badge" id="admins-count">0</span>
                </a>
              </li>
            </ul>
          </div>

          <div class="nav-section">
            <div class="nav-section-title">SISTEMA</div>
            <ul class="nav-list">
              <li class="nav-item">
                <a href="#" class="nav-link" data-view="reports">
                  <span class="nav-icon">📋</span>
                  <span class="nav-text">Reportes</span>
                </a>
              </li>
              <li class="nav-item">
                <a href="#" class="nav-link" data-view="settings">
                  <span class="nav-icon">⚙️</span>
                  <span class="nav-text">Configuración</span>
                </a>
              </li>
            </ul>
          </div>
        </nav>

        <!-- Usuario y Configuración -->
        <div class="sidebar-footer">
          <div class="user-profile-sidebar">
            <div class="user-avatar-sidebar">${currentUser?.name?.charAt(0) || 'A'}</div>
            <div class="user-info-sidebar">
              <div class="user-name-sidebar">${currentUser?.name || 'Admin'}</div>
              <div class="user-role-sidebar">Super Admin</div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Área Principal -->
      <div class="dashboard-main-area">
        <!-- Header Superior -->
        <header class="dashboard-top-header">
          <div class="header-content">
            <div class="header-left">
              <button class="mobile-menu-btn" aria-label="Abrir menú">☰</button>
              <h1 class="page-title">Analytics Dashboard</h1>
              <p class="page-subtitle">Sistema de Gestión Universitaria</p>
            </div>
            <div class="header-right">
              <div class="search-container">
                <input type="text" placeholder="Buscar usuarios, reportes..." class="global-search">
                <button class="search-btn">🔍</button>
              </div>
              <div class="header-actions">
                <button class="action-btn notifications" title="Notificaciones">
                  <span class="icon">🔔</span>
                  <span class="badge">3</span>
                </button>
                <button class="action-btn settings" title="Configuración">⚙️</button>
                <div class="user-info-header">
                  <span class="user-greeting">Viento: 1.9</span>
                  <span class="user-location">km/h</span>
                </div>
                <button class="logout-btn">Salir</button>
              </div>
            </div>
          </div>
        </header>

        <!-- Contenido Principal -->
        <main class="dashboard-content">
        <!-- Vista Dashboard Principal -->
        <div class="view-container active" id="dashboard-view">
          <!-- KPI Cards -->
          <div class="kpi-grid">
            <div class="kpi-card primary">
              <div class="kpi-header">
                <div class="kpi-icon">👨‍🎓</div>
                <div class="kpi-trend up">+12%</div>
              </div>
              <div class="kpi-content">
                <div class="kpi-value" id="total-students">0</div>
                <div class="kpi-label">Estudiantes Activos</div>
                <div class="kpi-sublabel">+23 este mes</div>
              </div>
              <div class="kpi-chart">
                <canvas id="students-mini-chart" width="100" height="40"></canvas>
              </div>
            </div>

            <div class="kpi-card success">
              <div class="kpi-header">
                <div class="kpi-icon">🚶‍♂️</div>
                <div class="kpi-trend up">+8%</div>
              </div>
              <div class="kpi-content">
                <div class="kpi-value" id="total-visitors">0</div>
                <div class="kpi-label">Visitantes Registrados</div>
                <div class="kpi-sublabel">+15 esta semana</div>
              </div>
              <div class="kpi-chart">
                <canvas id="visitors-mini-chart" width="100" height="40"></canvas>
              </div>
            </div>

            <div class="kpi-card warning">
              <div class="kpi-header">
                <div class="kpi-icon">⚡</div>
                <div class="kpi-trend neutral">0%</div>
              </div>
              <div class="kpi-content">
                <div class="kpi-value" id="active-sessions">0</div>
                <div class="kpi-label">Sesiones Activas</div>
                <div class="kpi-sublabel">En tiempo real</div>
              </div>
              <div class="kpi-chart">
                <canvas id="sessions-mini-chart" width="100" height="40"></canvas>
              </div>
            </div>

            <div class="kpi-card info">
              <div class="kpi-header">
                <div class="kpi-icon">👑</div>
                <div class="kpi-trend up">+2</div>
              </div>
              <div class="kpi-content">
                <div class="kpi-value" id="total-admins">0</div>
                <div class="kpi-label">Administradores</div>
                <div class="kpi-sublabel">Sistema seguro</div>
              </div>
              <div class="kpi-chart">
                <canvas id="admins-mini-chart" width="100" height="40"></canvas>
              </div>
            </div>
          </div>

          <!-- Gráficos Principales -->
          <div class="charts-grid">
            <div class="chart-container large">
              <div class="chart-header">
                <h3>Actividad del Sistema</h3>
                <div class="chart-controls">
                  <button class="control-btn active" data-period="24h">24H</button>
                  <button class="control-btn" data-period="7d">7D</button>
                  <button class="control-btn" data-period="30d">30D</button>
                  <button class="control-btn" data-period="90d">90D</button>
                </div>
              </div>
              <div class="chart-content">
                <canvas id="main-activity-chart" width="800" height="300"></canvas>
              </div>
            </div>

            <div class="chart-container medium">
              <div class="chart-header">
                <h3>Distribución por Carreras</h3>
                <button class="chart-action">📊</button>
              </div>
              <div class="chart-content">
                <canvas id="careers-distribution-chart" width="400" height="300"></canvas>
              </div>
            </div>
          </div>

          <!-- Widgets de Información -->
          <div class="widgets-grid">
            <div class="widget recent-activity">
              <div class="widget-header">
                <h3>Actividad Reciente</h3>
                <button class="widget-action">Ver Todo</button>
              </div>
              <div class="widget-content">
                <div class="activity-list" id="recent-activity-list">
                  <!-- Se llenará dinámicamente -->
                </div>
              </div>
            </div>

            <div class="widget system-status">
              <div class="widget-header">
                <h3>Estado del Sistema</h3>
                <div class="status-indicator online"></div>
              </div>
              <div class="widget-content">
                <div class="status-grid">
                  <div class="status-item">
                    <span class="status-label">Base de Datos</span>
                    <span class="status-value online">Operativa</span>
                  </div>
                  <div class="status-item">
                    <span class="status-label">Servidor</span>
                    <span class="status-value online">Estable</span>
                  </div>
                  <div class="status-item">
                    <span class="status-label">Backup</span>
                    <span class="status-value warning">Pendiente</span>
                  </div>
                  <div class="status-item">
                    <span class="status-label">Seguridad</span>
                    <span class="status-value online">Activa</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="widget recent-activity">
              <div class="widget-header">
                <div class="widget-title-group">
                  <div class="widget-icon">📊</div>
                  <h3>Actividad Reciente</h3>
                </div>
                <button class="widget-action">
                  <span class="action-icon">👁️</span>
                  Ver Todo
                </button>
              </div>
              <div class="widget-content">
                <div class="activity-list" id="recent-activity-list">
                  <div class="activity-item">
                    <div class="activity-icon student">👨‍🎓</div>
                    <div class="activity-details">
                      <div class="activity-text">Nuevo estudiante registrado</div>
                      <div class="activity-time">Hace 5 minutos</div>
                    </div>
                    <div class="activity-status new">Nuevo</div>
                  </div>
                  <div class="activity-item">
                    <div class="activity-icon visitor">🚶‍♂️</div>
                    <div class="activity-details">
                      <div class="activity-text">Visitante ingresó al campus</div>
                      <div class="activity-time">Hace 12 minutos</div>
                    </div>
                    <div class="activity-status active">Activo</div>
                  </div>
                  <div class="activity-item">
                    <div class="activity-icon admin">👨‍💼</div>
                    <div class="activity-details">
                      <div class="activity-text">Administrador actualizó permisos</div>
                      <div class="activity-time">Hace 1 hora</div>
                    </div>
                    <div class="activity-status completed">Completado</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="widget system-status">
              <div class="widget-header">
                <div class="widget-title-group">
                  <div class="widget-icon">⚡</div>
                  <h3>Estado del Sistema</h3>
                </div>
                <div class="status-indicator online">
                  <span class="status-dot"></span>
                  <span class="status-text">Operativo</span>
                </div>
              </div>
              <div class="widget-content">
                <div class="status-grid">
                  <div class="status-item">
                    <div class="status-item-header">
                      <span class="status-icon">🗄️</span>
                      <span class="status-label">Base de Datos</span>
                    </div>
                    <div class="status-value-container">
                      <span class="status-value online">Operativa</span>
                      <div class="status-metrics">
                        <span class="metric">99.9% uptime</span>
                      </div>
                    </div>
                  </div>
                  <div class="status-item">
                    <div class="status-item-header">
                      <span class="status-icon">🖥️</span>
                      <span class="status-label">Servidor</span>
                    </div>
                    <div class="status-value-container">
                      <span class="status-value online">Estable</span>
                      <div class="status-metrics">
                        <span class="metric">CPU: 45%</span>
                      </div>
                    </div>
                  </div>
                  <div class="status-item">
                    <div class="status-item-header">
                      <span class="status-icon">💾</span>
                      <span class="status-label">Backup</span>
                    </div>
                    <div class="status-value-container">
                      <span class="status-value warning">Pendiente</span>
                      <div class="status-metrics">
                        <span class="metric">Último: 2h ago</span>
                      </div>
                    </div>
                  </div>
                  <div class="status-item">
                    <div class="status-item-header">
                      <span class="status-icon">🔒</span>
                      <span class="status-label">Seguridad</span>
                    </div>
                    <div class="status-value-container">
                      <span class="status-value online">Activa</span>
                      <div class="status-metrics">
                        <span class="metric">SSL válido</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="widget quick-stats">
              <div class="widget-header">
                <div class="widget-title-group">
                  <div class="widget-icon">📈</div>
                  <h3>Estadísticas Rápidas</h3>
                </div>
                <button class="widget-action">
                  <span class="action-icon">🔄</span>
                  Actualizar
                </button>
              </div>
              <div class="widget-content">
                <div class="quick-stats-grid">
                  <div class="quick-stat-item">
                    <div class="quick-stat-icon success">📚</div>
                    <div class="quick-stat-details">
                      <div class="quick-stat-value">1,247</div>
                      <div class="quick-stat-label">Registros Hoy</div>
                    </div>
                    <div class="quick-stat-trend up">+12%</div>
                  </div>
                  <div class="quick-stat-item">
                    <div class="quick-stat-icon warning">⏰</div>
                    <div class="quick-stat-details">
                      <div class="quick-stat-value">23</div>
                      <div class="quick-stat-label">Tareas Pendientes</div>
                    </div>
                    <div class="quick-stat-trend down">-5%</div>
                  </div>
                  <div class="quick-stat-item">
                    <div class="quick-stat-icon info">🌐</div>
                    <div class="quick-stat-details">
                      <div class="quick-stat-value">89.5%</div>
                      <div class="quick-stat-label">Disponibilidad</div>
                    </div>
                    <div class="quick-stat-trend up">+2.1%</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="widget notifications">
              <div class="widget-header">
                <div class="widget-title-group">
                  <div class="widget-icon">🔔</div>
                  <h3>Notificaciones</h3>
                </div>
                <div class="notification-badge">3</div>
              </div>
              <div class="widget-content">
                <div class="notifications-list">
                  <div class="notification-item priority-high">
                    <div class="notification-icon">⚠️</div>
                    <div class="notification-content">
                      <div class="notification-title">Mantenimiento Programado</div>
                      <div class="notification-text">El sistema estará en mantenimiento mañana de 2:00 AM a 4:00 AM</div>
                      <div class="notification-time">Hace 30 minutos</div>
                    </div>
                    <button class="notification-dismiss">✕</button>
                  </div>
                  <div class="notification-item priority-medium">
                    <div class="notification-icon">📊</div>
                    <div class="notification-content">
                      <div class="notification-title">Reporte Mensual Listo</div>
                      <div class="notification-text">El reporte de actividades de diciembre está disponible</div>
                      <div class="notification-time">Hace 2 horas</div>
                    </div>
                    <button class="notification-dismiss">✕</button>
                  </div>
                  <div class="notification-item priority-low">
                    <div class="notification-icon">🎉</div>
                    <div class="notification-content">
                      <div class="notification-title">Nuevo Hito Alcanzado</div>
                      <div class="notification-text">¡Hemos superado los 1,000 usuarios registrados!</div>
                      <div class="notification-time">Hace 1 día</div>
                    </div>
                    <button class="notification-dismiss">✕</button>
                  </div>
                </div>
              </div>
            </div>

            <div class="widget quick-actions">
              <div class="widget-header">
                <div class="widget-title-group">
                  <div class="widget-icon">⚡</div>
                  <h3>Acciones Rápidas</h3>
                </div>
              </div>
              <div class="widget-content">
                <div class="quick-actions-grid">
                  <button class="quick-action" data-action="add-student">
                    <span class="action-icon">➕</span>
                    <span class="action-text">Nuevo Estudiante</span>
                  </button>
                  <button class="quick-action" data-action="backup">
                    <span class="action-icon">💾</span>
                    <span class="action-text">Backup Sistema</span>
                  </button>
                  <button class="quick-action" data-action="reports">
                    <span class="action-icon">📊</span>
                    <span class="action-text">Generar Reporte</span>
                  </button>
                  <button class="quick-action" data-action="maintenance">
                    <span class="action-icon">🔧</span>
                    <span class="action-text">Mantenimiento</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      <!-- Vista de Gestión de Estudiantes -->
        <div class="view-container" id="students-view">
          <div class="view-header">
            <div class="view-title">
              <h2>👨‍🎓 Gestión de Estudiantes</h2>
              <p>Control completo de estudiantes registrados</p>
            </div>
            <div class="view-actions">
              <button class="btn-primary" id="add-student">
                <span class="btn-icon">➕</span>
                Nuevo Estudiante
              </button>
              <button class="btn-secondary" id="export-students">
                <span class="btn-icon">📊</span>
                Exportar
              </button>
            </div>
          </div>

          <div class="filters-panel">
            <div class="search-section">
              <div class="search-input-container">
                <input type="text" id="student-search" placeholder="Buscar estudiantes..." class="modern-search">
                <span class="search-icon">🔍</span>
              </div>
            </div>
            <div class="filters-section">
              <select id="career-filter" class="modern-select">
                <option value="">Todas las Carreras</option>
                <option value="ingenieria">Ingeniería</option>
                <option value="medicina">Medicina</option>
                <option value="derecho">Derecho</option>
                <option value="administracion">Administración</option>
              </select>
              <select id="semester-filter" class="modern-select">
                <option value="">Todos los Semestres</option>
                <option value="1">1er Semestre</option>
                <option value="2">2do Semestre</option>
                <option value="3">3er Semestre</option>
                <option value="4">4to Semestre</option>
                <option value="5">5to Semestre</option>
                <option value="6">6to Semestre</option>
                <option value="7">7mo Semestre</option>
                <option value="8">8vo Semestre</option>
              </select>
              <select id="status-filter" class="modern-select">
                <option value="">Todos los Estados</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="suspendido">Suspendido</option>
              </select>
            </div>
          </div>

          <div class="data-grid">
            <div class="grid-header">
              <div class="grid-controls">
                <label class="checkbox-container">
                  <input type="checkbox" id="select-all-students">
                  <span class="checkmark"></span>
                </label>
                <span class="selected-count">0 seleccionados</span>
              </div>
              <div class="bulk-actions">
                <button class="bulk-btn edit" id="bulk-edit-students">✏️ Editar</button>
                <button class="bulk-btn delete" id="bulk-delete-students">🗑️ Eliminar</button>
              </div>
            </div>
            <div class="grid-content">
              <table class="modern-table" id="students-table">
                <thead>
                  <tr>
                    <th></th>
                    <th>Estudiante</th>
                    <th>Carrera</th>
                    <th>Semestre</th>
                    <th>Estado</th>
                    <th>Registro</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody id="students-tbody"></tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Vista de Gestión de Visitantes -->
        <div class="view-container" id="visitors-view">
          <div class="view-header">
            <div class="view-title">
              <h2>🚶‍♂️ Gestión de Visitantes</h2>
              <p>Control de accesos y permisos especiales</p>
            </div>
            <div class="view-actions">
              <button class="btn-primary" id="add-visitor">
                <span class="btn-icon">➕</span>
                Nuevo Visitante
              </button>
              <button class="btn-secondary" id="export-visitors">
                <span class="btn-icon">📊</span>
                Exportar
              </button>
            </div>
          </div>

          <div class="stats-row">
            <div class="stat-mini-card">
              <div class="stat-value" id="total-visits-today">0</div>
              <div class="stat-label">Visitas Hoy</div>
            </div>
            <div class="stat-mini-card">
              <div class="stat-value" id="avg-visit-duration">0min</div>
              <div class="stat-label">Duración Promedio</div>
            </div>
            <div class="stat-mini-card">
              <div class="stat-value" id="frequent-visitors-count">0</div>
              <div class="stat-label">Visitantes Frecuentes</div>
            </div>
          </div>

          <div class="filters-panel">
            <div class="search-section">
              <div class="search-input-container">
                <input type="text" id="visitor-search" placeholder="Buscar visitantes..." class="modern-search">
                <span class="search-icon">🔍</span>
              </div>
            </div>
            <div class="filters-section">
              <select id="visit-frequency-filter" class="modern-select">
                <option value="">Todas las Frecuencias</option>
                <option value="frequent">Frecuentes (>5 visitas)</option>
                <option value="regular">Regulares (2-5 visitas)</option>
                <option value="new">Nuevos (1 visita)</option>
              </select>
              <input type="date" id="visit-date-from" class="modern-input">
              <input type="date" id="visit-date-to" class="modern-input">
            </div>
          </div>

          <div class="data-grid">
            <div class="grid-content">
              <table class="modern-table" id="visitors-table">
                <thead>
                  <tr>
                    <th></th>
                    <th>Visitante</th>
                    <th>Visitas</th>
                    <th>Última Visita</th>
                    <th>Permisos</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody id="visitors-tbody"></tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Vista de Gestión de Administradores -->
        <div class="view-container" id="admins-view">
          <div class="view-header">
            <div class="view-title">
              <h2>👑 Gestión de Administradores</h2>
              <p>Control de privilegios y auditoría del sistema</p>
            </div>
            <div class="view-actions">
              <button class="btn-primary" id="add-admin">
                <span class="btn-icon">➕</span>
                Nuevo Administrador
              </button>
              <button class="btn-secondary" id="audit-report">
                <span class="btn-icon">📋</span>
                Reporte de Auditoría
              </button>
            </div>
          </div>

          <div class="security-alert">
            <div class="alert-icon">🔒</div>
            <div class="alert-content">
              <strong>Zona de Alta Seguridad</strong>
              <p>Todas las acciones son registradas y auditadas automáticamente</p>
            </div>
          </div>

          <div class="data-grid">
            <div class="grid-content">
              <table class="modern-table" id="admins-table">
                <thead>
                  <tr>
                    <th>Administrador</th>
                    <th>Privilegios</th>
                    <th>Último Acceso</th>
                    <th>Sesiones</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody id="admins-tbody"></tbody>
              </table>
            </div>
          </div>

          <div class="audit-panel">
            <div class="panel-header">
              <h3>📋 Registro de Auditoría Reciente</h3>
              <button class="panel-action">Ver Todo</button>
            </div>
            <div class="audit-log" id="audit-log">
              <!-- Los logs se cargarán dinámicamente -->
            </div>
          </div>
        </div>
        </main>
      </div>
    </div>
  `;
}

export function mount({ currentUser, navigate, showToast: showModal }) {
  let currentView = 'dashboard';
  let usersCache = [];
  let studentsCache = [];
  let visitorsCache = [];
  let adminsCache = [];
  let refreshInterval;

  // Funciones de navegación
  function showView(viewName) {
    // Unificar con nuevas vistas: usar .view-container y clase .active
    document.querySelectorAll('.view-container').forEach(view => {
      view.classList.remove('active');
      view.classList.add('hidden');
    });
    const targetId = viewName === 'dashboard' ? 'dashboard-view' : viewName;
    const target = document.getElementById(targetId);
    if (target) {
      target.classList.add('active');
      target.classList.remove('hidden');
    }
    currentView = viewName;
  }

  // Funciones de datos
  async function refreshAllStats() {
    try {
      const stats = await getDetailedStats();
      const users = await listUsers();
      usersCache = users;
      
      // Separar usuarios por tipo
      studentsCache = users.filter(u => u.role === 'estudiante');
      visitorsCache = users.filter(u => u.role === 'visitante');
      adminsCache = users.filter(u => u.role === 'admin');

      // Actualizar estadísticas principales
      updateDashboardStats(stats);
      
      // Actualizar gráficos
      updateCharts();
      
      // Actualizar métricas del sistema
      updateSystemMetrics();
      
    } catch (error) {
      console.error('Error refreshing stats:', error);
      showModal('Error al actualizar estadísticas', 'error');
    }
  }

  function updateDashboardStats(stats) {
    // Estadísticas de estudiantes
    document.getElementById('total-students').textContent = stats.estudiantes;
    document.getElementById('active-students').textContent = stats.estudiantesActivos;
    document.getElementById('inactive-students').textContent = stats.estudiantesInactivos;

    // Estadísticas de visitantes
    document.getElementById('total-visitors').textContent = stats.visitantes;
    document.getElementById('frequent-visitors').textContent = stats.visitantesActivos;
    document.getElementById('recent-visits').textContent = stats.recentLogins;

    // Estadísticas de administradores
    document.getElementById('total-admins').textContent = stats.admins;
    document.getElementById('online-admins').textContent = stats.adminsActivos;
    document.getElementById('recent-logins').textContent = stats.recentLogins;
  }

  function updateSystemMetrics() {
    document.getElementById('active-sessions').textContent = Math.floor(Math.random() * 50) + 10;
    document.getElementById('operations-per-min').textContent = Math.floor(Math.random() * 100) + 20;
    document.getElementById('last-backup').textContent = new Date().toLocaleString();
  }

  function updateCharts() {
    // Actualizar gráficos interactivos si están disponibles
    if (window.dashboardCharts) {
      const kpiData = {
        students: studentsCache.length,
        visitors: visitorsCache.length,
        sessions: Math.floor(Math.random() * 50) + 10, // Simulado
        admins: adminsCache.length
      };
      
      // Actualizar KPIs con animación
      window.dashboardCharts.updateKPIs(kpiData);
    }
    
    console.log('Gráficos actualizados');
  }

  // Gestión de estudiantes
  function loadStudentsManagement() {
    const tbody = document.getElementById('students-tbody');
    tbody.innerHTML = '';
    
    studentsCache.forEach((student, index) => {
      const row = document.createElement('tr');
      const statusClass = student.status === 'activo' ? 'status-active' : 
                         student.status === 'inactivo' ? 'status-inactive' : 'status-suspended';
      
      row.innerHTML = `
        <td><input type="checkbox" class="student-checkbox" data-id="${student.id}"></td>
        <td>${student.id}</td>
        <td>
          <div class="user-info">
            <div class="user-avatar">${student.name.charAt(0)}</div>
            <span>${student.name}</span>
          </div>
        </td>
        <td>${student.email}</td>
        <td>
          <select class="inline-edit" data-field="career" data-id="${student.id}">
            <option value="ingenieria" ${student.career === 'ingenieria' ? 'selected' : ''}>Ingeniería</option>
            <option value="medicina" ${student.career === 'medicina' ? 'selected' : ''}>Medicina</option>
            <option value="derecho" ${student.career === 'derecho' ? 'selected' : ''}>Derecho</option>
            <option value="administracion" ${student.career === 'administracion' ? 'selected' : ''}>Administración</option>
          </select>
        </td>
        <td>
          <select class="inline-edit" data-field="semester" data-id="${student.id}">
            <option value="1" ${student.semester === '1' ? 'selected' : ''}>1er Semestre</option>
            <option value="2" ${student.semester === '2' ? 'selected' : ''}>2do Semestre</option>
            <option value="3" ${student.semester === '3' ? 'selected' : ''}>3er Semestre</option>
            <option value="4" ${student.semester === '4' ? 'selected' : ''}>4to Semestre</option>
            <option value="5" ${student.semester === '5' ? 'selected' : ''}>5to Semestre</option>
            <option value="6" ${student.semester === '6' ? 'selected' : ''}>6to Semestre</option>
            <option value="7" ${student.semester === '7' ? 'selected' : ''}>7mo Semestre</option>
            <option value="8" ${student.semester === '8' ? 'selected' : ''}>8vo Semestre</option>
          </select>
        </td>
        <td>
          <span class="status-badge ${statusClass}">${student.status || 'activo'}</span>
        </td>
        <td>${student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'}</td>
        <td>
          <div class="action-buttons">
            <button class="btn-icon btn-edit" data-id="${student.id}" title="Editar">✏️</button>
            <button class="btn-icon btn-delete" data-id="${student.id}" title="Eliminar">🗑️</button>
            <button class="btn-icon btn-view" data-id="${student.id}" title="Ver Detalles">👁️</button>
          </div>
        </td>
      `;
      tbody.appendChild(row);
    });
  }

  // Gestión de visitantes
  function loadVisitorsManagement() {
    const tbody = document.getElementById('visitors-tbody');
    tbody.innerHTML = '';
    
    visitorsCache.forEach((visitor, index) => {
      const row = document.createElement('tr');
      const statusClass = visitor.status === 'activo' ? 'status-active' : 
                         visitor.status === 'inactivo' ? 'status-inactive' : 'status-suspended';
      const lastLoginDate = visitor.lastLogin ? new Date(visitor.lastLogin).toLocaleDateString() : 'Nunca';
      
      row.innerHTML = `
        <td><input type="checkbox" class="visitor-checkbox" data-id="${visitor.id}"></td>
        <td>${visitor.id}</td>
        <td>
          <div class="user-info">
            <div class="user-avatar">${visitor.name.charAt(0)}</div>
            <span>${visitor.name}</span>
          </div>
        </td>
        <td>${visitor.email}</td>
        <td>1</td>
        <td>${lastLoginDate}</td>
        <td>
          <select class="inline-edit" data-field="permissions" data-id="${visitor.id}">
            <option value="basic">Básicos</option>
            <option value="extended">Extendidos</option>
            <option value="special">Especiales</option>
          </select>
        </td>
        <td><span class="status-badge ${statusClass}">${visitor.status || 'activo'}</span></td>
        <td>
          <div class="action-buttons">
            <button class="btn-icon btn-edit" data-id="${visitor.id}" title="Editar">✏️</button>
            <button class="btn-icon btn-history" data-id="${visitor.id}" title="Historial">📋</button>
            <button class="btn-icon btn-permissions" data-id="${visitor.id}" title="Permisos">🔐</button>
          </div>
        </td>
      `;
      tbody.appendChild(row);
    });
  }

  // Gestión de administradores
  function loadAdminsManagement() {
    const tbody = document.getElementById('admins-tbody');
    tbody.innerHTML = '';
    
    adminsCache.forEach((admin, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${admin.id}</td>
        <td>
          <div class="user-info">
            <div class="user-avatar admin-avatar">${admin.name.charAt(0)}</div>
            <span>${admin.name}</span>
          </div>
        </td>
        <td>${admin.email}</td>
        <td>
          <div class="privileges-list">
            <span class="privilege-badge">Full Access</span>
            <span class="privilege-badge">User Management</span>
            <span class="privilege-badge">System Config</span>
          </div>
        </td>
        <td>${new Date().toLocaleString()}</td>
        <td><span class="session-indicator active">1 activa</span></td>
        <td><span class="status-badge status-active">Activo</span></td>
        <td>
          <div class="action-buttons">
            <button class="btn-icon btn-privileges" data-id="${admin.id}" title="Privilegios">👑</button>
            <button class="btn-icon btn-audit" data-id="${admin.id}" title="Auditoría">📋</button>
            <button class="btn-icon btn-sessions" data-id="${admin.id}" title="Sesiones">🔐</button>
          </div>
        </td>
      `;
      tbody.appendChild(row);
    });
  }

  // Event Listeners
  function setupEventListeners() {
    // Navegación principal
    document.getElementById('manage-students')?.addEventListener('click', () => {
      showView('students-management');
      loadStudentsManagement();
    });

    document.getElementById('manage-visitors')?.addEventListener('click', () => {
      showView('visitors-management');
      loadVisitorsManagement();
    });

    document.getElementById('manage-admins')?.addEventListener('click', () => {
      showView('admins-management');
      loadAdminsManagement();
    });

    // Botones de regreso
    document.getElementById('back-to-dashboard')?.addEventListener('click', () => showView('dashboard'));
    document.getElementById('back-to-dashboard-visitors')?.addEventListener('click', () => showView('dashboard'));
    document.getElementById('back-to-dashboard-admins')?.addEventListener('click', () => showView('dashboard'));

    // Botones de acción del header
    document.getElementById('backup-btn')?.addEventListener('click', () => {
      showModal && showModal('Backup del sistema iniciado correctamente', 'success');
    });

    document.getElementById('logs-btn')?.addEventListener('click', () => {
      showModal && showModal('Mostrando logs del sistema...', 'info');
    });

    // Logout desde el header del dashboard (sin Navbar)
    document.querySelector('.logout-btn')?.addEventListener('click', () => {
      try { localStorage.removeItem('currentUser'); } catch (e) {}
      showModal && showModal('Sesión cerrada.');
      if (navigate) navigate('login'); else window.location.hash = '#/login';
    });

    // Filtros de estudiantes
    document.getElementById('student-search')?.addEventListener('input', filterStudents);
    document.getElementById('career-filter')?.addEventListener('change', filterStudents);
    document.getElementById('semester-filter')?.addEventListener('change', filterStudents);
    document.getElementById('status-filter')?.addEventListener('change', filterStudents);

    // Filtros de visitantes
    document.getElementById('visitor-search')?.addEventListener('input', filterVisitors);
    document.getElementById('visit-frequency-filter')?.addEventListener('change', filterVisitors);

    // Navegación de la barra lateral
    const navLinks = document.querySelectorAll('.nav-link');
    const viewMap = {
      'dashboard': 'dashboard-view',
      'analytics': 'dashboard-view',
      'students': 'students-view',
      'visitors': 'visitors-view',
      'admins': 'admins-view'
    };
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const view = link.dataset.view;
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        const target = viewMap[view];
        if (target) {
          document.querySelectorAll('.view-container').forEach(v => v.classList.remove('active'));
          document.getElementById(target)?.classList.add('active');
        }
      });
    });
  }

  function filterStudents() {
    const searchTerm = document.getElementById('student-search')?.value.toLowerCase() || '';
    const careerFilter = document.getElementById('career-filter')?.value || '';
    const semesterFilter = document.getElementById('semester-filter')?.value || '';
    const statusFilter = document.getElementById('status-filter')?.value || '';

    const filteredStudents = studentsCache.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm) || 
                           student.email.toLowerCase().includes(searchTerm) ||
                           student.id.toString().includes(searchTerm);
      const matchesCareer = !careerFilter || student.career === careerFilter;
      const matchesSemester = !semesterFilter || student.semester === semesterFilter;
      const matchesStatus = !statusFilter || student.status === statusFilter;

      return matchesSearch && matchesCareer && matchesSemester && matchesStatus;
    });

    displayFilteredStudents(filteredStudents);
  }

  function filterVisitors() {
    const searchTerm = document.getElementById('visitor-search')?.value.toLowerCase() || '';
    const frequencyFilter = document.getElementById('visit-frequency-filter')?.value || '';

    const filteredVisitors = visitorsCache.filter(visitor => {
      const matchesSearch = visitor.name.toLowerCase().includes(searchTerm) || 
                           visitor.email.toLowerCase().includes(searchTerm) ||
                           visitor.id.toString().includes(searchTerm);
      // Aquí podrías agregar lógica para filtrar por frecuencia de visitas
      return matchesSearch;
    });

    displayFilteredVisitors(filteredVisitors);
  }

  function displayFilteredStudents(students) {
    const tbody = document.getElementById('students-tbody');
    tbody.innerHTML = '';
    
    students.forEach(student => {
      const row = document.createElement('tr');
      const statusClass = student.status === 'activo' ? 'status-active' : 
                         student.status === 'inactivo' ? 'status-inactive' : 'status-suspended';
      
      row.innerHTML = `
        <td><input type="checkbox" class="student-checkbox" data-id="${student.id}"></td>
        <td>${student.id}</td>
        <td>
          <div class="user-info">
            <div class="user-avatar">${student.name.charAt(0)}</div>
            <span>${student.name}</span>
          </div>
        </td>
        <td>${student.email}</td>
        <td>
          <select class="inline-edit" data-field="career" data-id="${student.id}">
            <option value="ingenieria" ${student.career === 'ingenieria' ? 'selected' : ''}>Ingeniería</option>
            <option value="medicina" ${student.career === 'medicina' ? 'selected' : ''}>Medicina</option>
            <option value="derecho" ${student.career === 'derecho' ? 'selected' : ''}>Derecho</option>
            <option value="administracion" ${student.career === 'administracion' ? 'selected' : ''}>Administración</option>
          </select>
        </td>
        <td>
          <select class="inline-edit" data-field="semester" data-id="${student.id}">
            <option value="1" ${student.semester === '1' ? 'selected' : ''}>1er Semestre</option>
            <option value="2" ${student.semester === '2' ? 'selected' : ''}>2do Semestre</option>
            <option value="3" ${student.semester === '3' ? 'selected' : ''}>3er Semestre</option>
            <option value="4" ${student.semester === '4' ? 'selected' : ''}>4to Semestre</option>
            <option value="5" ${student.semester === '5' ? 'selected' : ''}>5to Semestre</option>
            <option value="6" ${student.semester === '6' ? 'selected' : ''}>6to Semestre</option>
            <option value="7" ${student.semester === '7' ? 'selected' : ''}>7mo Semestre</option>
            <option value="8" ${student.semester === '8' ? 'selected' : ''}>8vo Semestre</option>
          </select>
        </td>
        <td>
          <span class="status-badge ${statusClass}">${student.status || 'activo'}</span>
        </td>
        <td>${student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'}</td>
        <td>
          <div class="action-buttons">
            <button class="btn-icon btn-edit" data-id="${student.id}" title="Editar">✏️</button>
            <button class="btn-icon btn-delete" data-id="${student.id}" title="Eliminar">🗑️</button>
            <button class="btn-icon btn-view" data-id="${student.id}" title="Ver Detalles">👁️</button>
          </div>
        </td>
      `;
      tbody.appendChild(row);
    });

    // Reattach event listeners for the new elements
    attachTableEventListeners();
  }

  function displayFilteredVisitors(visitors) {
    const tbody = document.getElementById('visitors-tbody');
    tbody.innerHTML = '';
    
    visitors.forEach(visitor => {
      const row = document.createElement('tr');
      const statusClass = visitor.status === 'activo' ? 'status-active' : 
                         visitor.status === 'inactivo' ? 'status-inactive' : 'status-suspended';
      const lastLoginDate = visitor.lastLogin ? new Date(visitor.lastLogin).toLocaleDateString() : 'Nunca';
      
      row.innerHTML = `
        <td><input type="checkbox" class="visitor-checkbox" data-id="${visitor.id}"></td>
        <td>${visitor.id}</td>
        <td>
          <div class="user-info">
            <div class="user-avatar">${visitor.name.charAt(0)}</div>
            <span>${visitor.name}</span>
          </div>
        </td>
        <td>${visitor.email}</td>
        <td>1</td>
        <td>${lastLoginDate}</td>
        <td>
          <select class="inline-edit" data-field="permissions" data-id="${visitor.id}">
            <option value="basic">Básicos</option>
            <option value="extended">Extendidos</option>
            <option value="special">Especiales</option>
          </select>
        </td>
        <td><span class="status-badge ${statusClass}">${visitor.status || 'activo'}</span></td>
        <td>
          <div class="action-buttons">
            <button class="btn-icon btn-edit" data-id="${visitor.id}" title="Editar">✏️</button>
            <button class="btn-icon btn-history" data-id="${visitor.id}" title="Historial">📋</button>
            <button class="btn-icon btn-delete" data-id="${visitor.id}" title="Eliminar">🗑️</button>
          </div>
        </td>
      `;
      tbody.appendChild(row);
    });

    // Reattach event listeners for the new elements
    attachTableEventListeners();
  }

  // Función para manejar eventos de las tablas
  function attachTableEventListeners() {
    // Event listeners para edición inline
    document.querySelectorAll('.inline-edit').forEach(select => {
      select.addEventListener('change', async (e) => {
        const userId = e.target.dataset.id;
        const field = e.target.dataset.field;
        const value = e.target.value;
        
        try {
          await updateUser(parseInt(userId), { [field]: value });
          showModal(`${field} actualizado correctamente`, 'success');
          refreshAllStats();
        } catch (error) {
          showModal(`Error al actualizar ${field}: ${error.message}`, 'error');
        }
      });
    });

    // Event listeners para botones de acción
    document.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const userId = e.target.dataset.id;
        editUser(userId);
      });
    });

    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const userId = e.target.dataset.id;
        deleteUserConfirm(userId);
      });
    });

    document.querySelectorAll('.btn-view').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const userId = e.target.dataset.id;
        viewUserDetails(userId);
      });
    });

    document.querySelectorAll('.btn-history').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const userId = e.target.dataset.id;
        viewUserHistory(userId);
      });
    });
  }

  // Funciones de gestión de usuarios
  async function editUser(userId) {
    const user = usersCache.find(u => u.id == userId);
    if (!user) return;

    const newName = prompt('Nuevo nombre:', user.name);
    if (newName && newName !== user.name) {
      try {
        await updateUser(parseInt(userId), { name: newName });
        showModal('Usuario actualizado correctamente', 'success');
        refreshAllStats();
      } catch (error) {
        showModal(`Error al actualizar usuario: ${error.message}`, 'error');
      }
    }
  }

  async function deleteUserConfirm(userId) {
    const user = usersCache.find(u => u.id == userId);
    if (!user) return;

    if (confirm(`¿Estás seguro de eliminar al usuario ${user.name}?`)) {
      try {
        await deleteUser(parseInt(userId));
        showModal('Usuario eliminado correctamente', 'success');
        refreshAllStats();
      } catch (error) {
        showModal(`Error al eliminar usuario: ${error.message}`, 'error');
      }
    }
  }

  function viewUserDetails(userId) {
    const user = usersCache.find(u => u.id == userId);
    if (!user) return;

    const details = `
      ID: ${user.id}
      Nombre: ${user.name}
      Email: ${user.email}
      Rol: ${user.role}
      ${user.career ? `Carrera: ${user.career}` : ''}
      ${user.semester ? `Semestre: ${user.semester}` : ''}
      Estado: ${user.status || 'activo'}
      Creado: ${user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}
      Último login: ${user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Nunca'}
    `;
    
    showModal(`Detalles del Usuario\n\n${details}`, 'info');
  }

  async function viewUserHistory(userId) {
    try {
      const logs = await getLogs({ userId: parseInt(userId), limit: 10 });
      const historyText = logs.map(log => 
        `${new Date(log.timestamp).toLocaleString()}: ${log.details}`
      ).join('\n');
      
      showModal(`Historial del Usuario\n\n${historyText || 'No hay actividad registrada'}`, 'info');
    } catch (error) {
      showModal(`Error al cargar historial: ${error.message}`, 'error');
    }
  }

  // Funciones auxiliares
  function showModal(message, type = 'info') {
    // Crear modal si no existe
    let modal = document.getElementById('admin-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'admin-modal';
      modal.className = 'modal';
      modal.innerHTML = `
        <div class="modal-content">
          <span class="modal-close">&times;</span>
          <div class="modal-body">
            <div class="modal-icon"></div>
            <div class="modal-message"></div>
          </div>
          <div class="modal-actions">
            <button class="btn btn-primary modal-ok">OK</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      // Event listeners para cerrar modal
      modal.querySelector('.modal-close').addEventListener('click', () => {
        modal.style.display = 'none';
      });
      modal.querySelector('.modal-ok').addEventListener('click', () => {
        modal.style.display = 'none';
      });
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.style.display = 'none';
        }
      });
    }

    // Configurar contenido del modal
    const modalContent = modal.querySelector('.modal-content');
    const modalIcon = modal.querySelector('.modal-icon');
    const modalMessage = modal.querySelector('.modal-message');

    modalContent.className = `modal-content modal-${type}`;
    modalIcon.textContent = type === 'success' ? '✅' : 
                           type === 'error' ? '❌' : 
                           type === 'warning' ? '⚠️' : 'ℹ️';
    modalMessage.textContent = message;

    // Mostrar modal
    modal.style.display = 'block';
  }

  async function refreshAllStats() {
    try {
      // Actualizar caché de usuarios
      usersCache = await listUsers();
      studentsCache = usersCache.filter(u => u.role === 'estudiante');
      visitorsCache = usersCache.filter(u => u.role === 'visitante');
      adminsCache = usersCache.filter(u => u.role === 'admin');

      // Actualizar estadísticas
      await refreshStats();
      await updateDashboardStats();
      await updateSystemMetrics();
      await updateCharts();

      // Actualizar tablas si están visibles
      const activeTab = document.querySelector('.tab-button.active')?.dataset.tab;
      if (activeTab === 'students') {
        displayFilteredStudents(studentsCache);
      } else if (activeTab === 'visitors') {
        displayFilteredVisitors(visitorsCache);
      } else if (activeTab === 'admins') {
        displayFilteredAdmins(adminsCache);
      }
    } catch (error) {
      console.error('Error al actualizar estadísticas:', error);
    }
  }

  function displayFilteredAdmins(admins) {
    const tbody = document.getElementById('admins-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    admins.forEach(admin => {
      const row = document.createElement('tr');
      const statusClass = admin.status === 'activo' ? 'status-active' : 
                         admin.status === 'inactivo' ? 'status-inactive' : 'status-suspended';
      const lastLoginDate = admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString() : 'Nunca';
      
      row.innerHTML = `
        <td><input type="checkbox" class="admin-checkbox" data-id="${admin.id}"></td>
        <td>${admin.id}</td>
        <td>
          <div class="user-info">
            <div class="user-avatar">${admin.name.charAt(0)}</div>
            <span>${admin.name}</span>
          </div>
        </td>
        <td>${admin.email}</td>
        <td>
          <select class="inline-edit" data-field="permissions" data-id="${admin.id}">
            <option value="full">Completos</option>
            <option value="limited">Limitados</option>
            <option value="read-only">Solo Lectura</option>
          </select>
        </td>
        <td>${lastLoginDate}</td>
        <td><span class="status-badge ${statusClass}">${admin.status || 'activo'}</span></td>
        <td>
          <div class="action-buttons">
            <button class="btn-icon btn-edit" data-id="${admin.id}" title="Editar">✏️</button>
            <button class="btn-icon btn-audit" data-id="${admin.id}" title="Auditoría">🔍</button>
            <button class="btn-icon btn-permissions" data-id="${admin.id}" title="Permisos">🔐</button>
          </div>
        </td>
      `;
      tbody.appendChild(row);
    });

    // Reattach event listeners for the new elements
    attachAdminEventListeners();
  }

  function attachAdminEventListeners() {
    // Event listeners para botones de administradores
    document.querySelectorAll('.btn-audit').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const userId = e.target.dataset.id;
        try {
          const logs = await getLogs({ userId: parseInt(userId), limit: 20 });
          const auditText = logs.map(log => 
            `${new Date(log.timestamp).toLocaleString()}: ${log.action} - ${log.details}`
          ).join('\n');
          
          showModal(`Auditoría del Administrador\n\n${auditText || 'No hay actividad registrada'}`, 'info');
        } catch (error) {
          showModal(`Error al cargar auditoría: ${error.message}`, 'error');
        }
      });
    });

    document.querySelectorAll('.btn-permissions').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const userId = e.target.dataset.id;
        const admin = adminsCache.find(a => a.id == userId);
        if (admin) {
          showModal(`Gestión de Permisos para ${admin.name}\n\nEsta funcionalidad estará disponible en una próxima versión.`, 'info');
        }
      });
    });
  }

  // Variables de caché (ya declaradas anteriormente)
  // let usersCache = [];
  // let studentsCache = [];
  // let visitorsCache = [];
  // let adminsCache = [];
  // let refreshInterval;

  // ===== Funcionalidades de diseño =====
  function initMobileMenu() {
    const sidebar = document.querySelector('.modern-sidebar');
    const menuBtn = document.querySelector('.mobile-menu-btn');
    if (!sidebar || !menuBtn) return;

    const overlay = document.createElement('div');
    overlay.className = 'mobile-overlay';
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.5); z-index: 9998; opacity: 0; visibility: hidden;
      transition: all 0.3s ease;
    `;
    document.body.appendChild(overlay);

    const open = () => {
      sidebar.classList.add('mobile-open');
      overlay.style.opacity = '1';
      overlay.style.visibility = 'visible';
      document.body.style.overflow = 'hidden';
    };
    const close = () => {
      sidebar.classList.remove('mobile-open');
      overlay.style.opacity = '0';
      overlay.style.visibility = 'hidden';
      document.body.style.overflow = '';
    };

    menuBtn.addEventListener('click', () => {
      if (sidebar.classList.contains('mobile-open')) close(); else open();
    });
    overlay.addEventListener('click', close);
    window.addEventListener('resize', () => { if (window.innerWidth > 768) close(); });
  }

  function initActiveNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      });
    });
  }

  function initCardAnimations() {
    const cards = document.querySelectorAll('.kpi-card, .chart-card, .widget-card');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.1 });

    cards.forEach((card, idx) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(16px)';
      card.style.transition = `opacity 0.5s ease ${idx * 0.05}s, transform 0.5s ease ${idx * 0.05}s`;
      observer.observe(card);
    });
  }

  // Inicialización
  function init() {
    setupEventListeners();
    refreshAllStats();
    
    // Aplicar optimizaciones de rendimiento
    performanceOptimizations();
    
    // Inicializar funcionalidades del nuevo diseño
    initMobileMenu();
    initActiveNavigation();
    initCardAnimations();
    
    // Inicializar gráficos del dashboard
    if (typeof DashboardCharts !== 'undefined') {
      window.dashboardCharts = new DashboardCharts();
      
      // Configurar controles de período para el gráfico principal
      document.querySelectorAll('.control-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          // Remover clase active de todos los botones
          document.querySelectorAll('.control-btn').forEach(b => b.classList.remove('active'));
          // Agregar clase active al botón clickeado
          e.target.classList.add('active');
          
          // Actualizar gráfico con el nuevo período
          const period = e.target.dataset.period;
          window.dashboardCharts.updateMainActivityChart(period);
        });
      });
    }
    
    // Actualización en tiempo real cada 5 segundos
    refreshInterval = setInterval(refreshAllStats, 5000);
    
    // Escuchar cambios en la base de datos
    window.addEventListener('dbchange', refreshAllStats);
  }

  // Optimizaciones de rendimiento
  function performanceOptimizations() {
    // Debounce search inputs
    debounceSearch();
    
    // Lazy load charts
    lazyLoadCharts();
    
    // Optimize table rendering
    optimizeTableRendering();
    
    // Preload critical resources
    preloadCriticalResources();
    
    // Enable virtual scrolling for large datasets
    enableVirtualScrolling();
    
    // Setup resize handler
    setupResizeHandler();
  }

  function debounceSearch() {
    const searchInputs = document.querySelectorAll('.modern-search');
    searchInputs.forEach(input => {
      let timeout;
      input.addEventListener('input', (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          performSearch(e.target.value, e.target.dataset.searchType);
        }, 300);
      });
    });
  }

  function lazyLoadCharts() {
    // Use Intersection Observer for lazy loading charts
    const chartObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const chartId = entry.target.id;
          loadChart(chartId);
          chartObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.chart-card canvas').forEach(canvas => {
      chartObserver.observe(canvas);
    });
  }

  function loadChart(chartId) {
    // Load chart only when visible
    if (chartId === 'activityChart') {
      initActivityChart();
    } else if (chartId === 'usersChart') {
      initUsersChart();
    }
  }

  function optimizeTableRendering() {
    // Implement virtual scrolling for large tables
    const tables = document.querySelectorAll('.modern-table tbody');
    tables.forEach(tbody => {
      if (tbody.children.length > 50) {
        implementVirtualScrolling(tbody);
      }
    });
  }

  function implementVirtualScrolling(tbody) {
    const rowHeight = 60; // Approximate row height
    const containerHeight = 400; // Visible container height
    const visibleRows = Math.ceil(containerHeight / rowHeight);
    const totalRows = tbody.children.length;
    
    let scrollTop = 0;
    let startIndex = 0;
    let endIndex = Math.min(visibleRows, totalRows);

    // Hide all rows initially except visible ones
    Array.from(tbody.children).forEach((row, index) => {
      row.style.display = index < endIndex ? '' : 'none';
      row.style.position = 'relative';
    });

    const tableContainer = tbody.closest('.table-container') || tbody.parentElement;
    tableContainer.addEventListener('scroll', () => {
      scrollTop = tableContainer.scrollTop;
      startIndex = Math.floor(scrollTop / rowHeight);
      endIndex = Math.min(startIndex + visibleRows + 5, totalRows);

      Array.from(tbody.children).forEach((row, index) => {
        row.style.display = (index >= startIndex && index < endIndex) ? '' : 'none';
      });
    });
  }

  function preloadCriticalResources() {
    // Preload critical CSS and JS
    const criticalResources = [
      '/css/admin-dashboard.css',
      '/js/charts.js'
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      link.as = resource.endsWith('.css') ? 'style' : 'script';
      document.head.appendChild(link);
    });
  }

  function enableVirtualScrolling() {
    // Enable virtual scrolling for large lists
    const largeLists = document.querySelectorAll('.activity-list, .notification-list');
    largeLists.forEach(list => {
      if (list.children.length > 20) {
        setupVirtualScrolling(list);
      }
    });
  }

  function setupVirtualScrolling(list) {
    const itemHeight = 60;
    const containerHeight = 300;
    const visibleItems = Math.ceil(containerHeight / itemHeight);
    const totalItems = list.children.length;

    if (totalItems <= visibleItems) return;

    list.style.height = `${containerHeight}px`;
    list.style.overflow = 'auto';

    let startIndex = 0;
    let endIndex = visibleItems;

    const updateVisibleItems = () => {
      Array.from(list.children).forEach((item, index) => {
        item.style.display = (index >= startIndex && index < endIndex) ? '' : 'none';
      });
    };

    list.addEventListener('scroll', () => {
      const scrollTop = list.scrollTop;
      startIndex = Math.floor(scrollTop / itemHeight);
      endIndex = Math.min(startIndex + visibleItems + 2, totalItems);
      updateVisibleItems();
    });

    updateVisibleItems();
  }

  // Optimized data fetching with caching
  async function fetchDataWithCache(endpoint, cacheKey, ttl = 300000) { // 5 minutes TTL
    const cached = getFromCache(cacheKey);
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data;
    }

    try {
      const response = await fetch(endpoint);
      const data = await response.json();
      
      setCache(cacheKey, {
        data: data,
        timestamp: Date.now()
      });
      
      return data;
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      return cached ? cached.data : null;
    }
  }

  function getFromCache(key) {
    try {
      const cached = localStorage.getItem(`dashboard_cache_${key}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Cache read error:', error);
      return null;
    }
  }

  function setCache(key, value) {
    try {
      localStorage.setItem(`dashboard_cache_${key}`, JSON.stringify(value));
    } catch (error) {
      console.error('Cache write error:', error);
    }
  }

  // Throttled resize handler
  function setupResizeHandler() {
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        handleResize();
      }, 250);
    });
  }

  function handleResize() {
    // Redraw charts on resize
    if (window.dashboardCharts) {
      Object.values(window.dashboardCharts).forEach(chart => {
        if (chart && typeof chart.resize === 'function') {
          chart.resize();
        }
      });
    }
  }

  function clearOldCache() {
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    const now = Date.now();
    
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith('dashboard_cache_')) {
        try {
          const cached = JSON.parse(localStorage.getItem(key));
          if (now - cached.timestamp > maxAge) {
            localStorage.removeItem(key);
          }
        } catch (error) {
          localStorage.removeItem(key);
        }
      }
    }
  }

  // Limpieza al desmontar
  function cleanup() {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
    
    // Limpiar gráficos
    if (window.dashboardCharts) {
      window.dashboardCharts.destroy();
      window.dashboardCharts = null;
    }
    
    // Limpiar caché antiguo
    clearOldCache();
    
    // Remover event listeners
    window.removeEventListener('dbchange', refreshAllStats);
    window.removeEventListener('resize', handleResize);
  }

  // Inicializar
  init();

  // Retornar función de limpieza
  return cleanup;
}