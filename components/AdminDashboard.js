export function render() {
  return `
    <div class="admin-dashboard-modern">
      <aside class="sidebar">
        <div class="sidebar-header">
          <button class="sidebar-toggle"><i class="fas fa-bars"></i></button>
          <span>@ Your Company</span>
        </div>
        <nav class="sidebar-nav">
          <a href="#" class="nav-item"><i class="fas fa-search"></i><span class="nav-label">Buscar</span></a>
          <a href="#" class="nav-item active"><i class="fas fa-home"></i><span class="nav-label">Inicio</span></a>
          <a href="#" class="nav-item"><i class="fas fa-flag"></i><span class="nav-label">Reportes</span></a>
          <a href="#" class="nav-item"><i class="fas fa-chart-pie"></i><span class="nav-label">Estadísticas</span></a>
          <a href="#" class="nav-item"><i class="fas fa-envelope"></i><span class="nav-label">Mensajes</span></a>
          <a href="#" class="nav-item"><i class="fas fa-calendar-alt"></i><span class="nav-label">Calendario</span></a>
          <a href="#" class="nav-item"><i class="fas fa-users"></i><span class="nav-label">Usuarios</span></a>
          <a href="#" class="nav-item"><i class="fas fa-cog"></i><span class="nav-label">Ajustes</span></a>
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
          </div>
        </header>
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
          <div class="kpi-card">
            <div class="kpi-header">
              <span>Conversion Rate</span>
              <i class="fas fa-user-check"></i>
            </div>
            <div class="kpi-value">12.8%</div>
            <div class="kpi-change negative">-1.22%</div>
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
      </main>
    </div>
  `;
}

export function mount() {
  const salesCtx = document.getElementById('sales-performance-chart').getContext('2d');
  const salesChart = new Chart(salesCtx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
      datasets: [
        {
          label: 'Laptops',
          data: [65, 59, 80, 81, 56],
          borderColor: '#33374c',
          tension: 0.4,
          fill: false,
        },
        {
          label: 'Headsets',
          data: [28, 48, 40, 19, 86],
          borderColor: '#a0a0a0',
          tension: 0.4,
          fill: false,
        },
        {
          label: 'Monitors',
          data: [18, 58, 30, 69, 26],
          borderColor: '#c0c0c0',
          tension: 0.4,
          fill: false,
        },
        {
          label: 'Phones',
          data: [38, 28, 60, 59, 76],
          borderColor: '#e0e0e0',
          tension: 0.4,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 2.0,
      resizeDelay: 150,
      plugins: {
        legend: {
          position: 'top',
          align: 'start',
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });

  const categoriesCtx = document.getElementById('popular-categories-chart').getContext('2d');
  const categoriesChart = new Chart(categoriesCtx, {
    type: 'doughnut',
    data: {
      labels: ['Electronics', 'Furniture', 'Toys'],
      datasets: [{
        label: 'Popular Categories',
        data: [300, 150, 100],
        backgroundColor: [
          '#33374c',
          '#a0a0a0',
          '#e0e0e0',
        ],
        borderWidth: 0,
      }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 1.2,
        resizeDelay: 150,
        plugins: {
            legend: {
                position: 'bottom',
            }
        }
    }
  });

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
  applyAdaptiveRatios();
  window.addEventListener('resize', applyAdaptiveRatios);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      applyAdaptiveRatios();
    }
  });

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
}