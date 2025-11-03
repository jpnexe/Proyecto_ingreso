import { mountWeather } from './Weather.js';

export function renderNavbar(currentUser, activeRoute) {
  const isActive = (r) => (activeRoute === r ? 'active' : '');
  
  // Si el usuario está logueado, mostrar navbar personalizado según el rol
  if (currentUser) {
    if (activeRoute === 'estudiantes') {
      return renderStudentNavbar(currentUser);
    } else if (activeRoute === 'admin') {
      return renderAdminNavbar(currentUser);
    } else if (activeRoute === 'visitantes') {
      return renderVisitorNavbar(currentUser);
    }
  }
  
  return `
    <div class="navbar-inner">
      <div class="brand">
        <div class="logo"></div>
        <div>
          <div>Universidad</div>
          <div class="small">Portal institucional</div>
        </div>
      </div>
      
      <!-- Menú hamburguesa para móviles -->
      <div class="hamburger-menu" id="hamburger-menu">
        <div class="hamburger-line"></div>
        <div class="hamburger-line"></div>
        <div class="hamburger-line"></div>
      </div>
      
      <!-- Navegación normal para desktop -->
      <nav class="nav">
        <a href="#/login" class="${isActive('login')}">Login</a>
        <a href="#/registro" class="${isActive('registro')}">Registro</a>
        <a href="#/admin" class="${isActive('admin')}">Administradores</a>
        <a href="#/estudiantes" class="${isActive('estudiantes')}">Estudiantes</a>
        <a href="#/visitantes" class="${isActive('visitantes')}">Visitantes</a>
        ${currentUser ? `<span class="badge">${currentUser.name} · <span class="role-${currentUser.role}">${currentUser.role}</span></span>` : ''}
        ${currentUser ? `<button id="logout" class="btn btn-orange" title="Cerrar sesión">Salir</button>` : ''}
        <div id="weather"></div>
      </nav>
      
      <!-- Menú móvil desplegable -->
      <div class="mobile-nav" id="mobile-nav">
        <nav class="nav">
          <a href="#/login" class="${isActive('login')}">Login</a>
          <a href="#/registro" class="${isActive('registro')}">Registro</a>
          <a href="#/admin" class="${isActive('admin')}">Administradores</a>
          <a href="#/estudiantes" class="${isActive('estudiantes')}">Estudiantes</a>
          <a href="#/visitantes" class="${isActive('visitantes')}">Visitantes</a>
          ${currentUser ? `<span class="badge">${currentUser.name} · <span class="role-${currentUser.role}">${currentUser.role}</span></span>` : ''}
          ${currentUser ? `<button id="logout-mobile" class="btn btn-orange" title="Cerrar sesión">Salir</button>` : ''}
          <div id="weather-mobile"></div>
        </nav>
      </div>
    </div>
   `;
}

// Función para montar la funcionalidad del navbar de estudiantes
function mountStudentNavbar(currentUser, navigate, toast) {
  // Funcionalidad del botón de logout para estudiantes
  const logoutStudentBtn = document.getElementById('logout-student');
  if (logoutStudentBtn) {
    logoutStudentBtn.addEventListener('click', () => {
      sessionStorage.removeItem('currentUser');
      toast('Sesión cerrada.');
      navigate('login');
    });
  }
  
  // Montar el clima en el widget del navbar de estudiantes
  mountWeather('weather-student');
}

// Función para montar la funcionalidad del navbar de administradores
function mountAdminNavbar(currentUser, navigate, toast) {
  // Funcionalidad del botón de logout para administradores
  const logoutAdminBtn = document.getElementById('logout-admin');
  if (logoutAdminBtn) {
    logoutAdminBtn.addEventListener('click', () => {
      sessionStorage.removeItem('currentUser');
      toast('Sesión de administrador cerrada.');
      navigate('login');
    });
  }
  
  // Montar el clima en el widget del navbar de administradores
  mountWeather('weather-admin');
}

// Función para montar la funcionalidad del navbar de visitantes
function mountVisitorNavbar(currentUser, navigate, toast) {
  // Funcionalidad del botón de logout para visitantes
  const logoutVisitorBtn = document.getElementById('logout-visitor');
  if (logoutVisitorBtn) {
    logoutVisitorBtn.addEventListener('click', () => {
      sessionStorage.removeItem('currentUser');
      toast('Sesión de visitante cerrada.');
      navigate('login');
    });
  }
  
  // Montar el clima en el widget del navbar de visitantes
  mountWeather('weather-visitor');
}

export function mountNavbar(currentUser, navigate, toast, activeRoute) {
  // Si estamos en secciones específicas, montar funcionalidad correspondiente
  if (currentUser) {
    if (activeRoute === 'estudiantes') {
      mountStudentNavbar(currentUser, navigate, toast);
      return;
    } else if (activeRoute === 'admin') {
      mountAdminNavbar(currentUser, navigate, toast);
      return;
    } else if (activeRoute === 'visitantes') {
      mountVisitorNavbar(currentUser, navigate, toast);
      return;
    }
  }
  
  // Funcionalidad del botón de logout (desktop)
  const logoutBtn = document.getElementById('logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('currentUser');
      toast('Sesión cerrada.');
      navigate('login');
    });
  }
  
  // Funcionalidad del botón de logout (móvil)
  const logoutMobileBtn = document.getElementById('logout-mobile');
  if (logoutMobileBtn) {
    logoutMobileBtn.addEventListener('click', () => {
      sessionStorage.removeItem('currentUser');
      toast('Sesión cerrada.');
      navigate('login');
    });
  }
  
  // Funcionalidad del menú hamburguesa
  const hamburgerMenu = document.getElementById('hamburger-menu');
  const mobileNav = document.getElementById('mobile-nav');
  
  if (hamburgerMenu && mobileNav) {
    hamburgerMenu.addEventListener('click', () => {
      // Toggle del menú hamburguesa
      hamburgerMenu.classList.toggle('active');
      mobileNav.classList.toggle('active');
    });
    
    // Cerrar menú al hacer clic en un enlace
    const mobileLinks = mobileNav.querySelectorAll('a');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        hamburgerMenu.classList.remove('active');
        mobileNav.classList.remove('active');
      });
    });
    
    // Cerrar menú al hacer clic fuera de él
    document.addEventListener('click', (e) => {
      if (!hamburgerMenu.contains(e.target) && !mobileNav.contains(e.target)) {
        hamburgerMenu.classList.remove('active');
        mobileNav.classList.remove('active');
      }
    });
  }
  
  // Montar el clima en ambos contenedores
  mountWeather('weather');
  mountWeather('weather-mobile');
}

// Función para renderizar el navbar personalizado de estudiantes
function renderStudentNavbar(currentUser) {
  return `
    <div class="student-navbar">
      <div class="navbar-inner">
        <div class="brand">
          <div>Portal Estudiantes</div>
        </div>
        
        <div class="student-info">
          <div class="user-avatar">
            ${currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div class="user-details">
            <p class="user-name">${currentUser.name}</p>
            <p class="user-role">${currentUser.role}</p>
          </div>
          <div class="weather-widget" id="weather-student"></div>
          <button id="logout-student" class="btn-logout">
            <span class="logout-icon">🚪</span>
            Salir
          </button>
        </div>
      </div>
    </div>
  `;
}

// Función para renderizar el navbar personalizado de administradores
function renderAdminNavbar(currentUser) {
  return `
    <div class="admin-navbar">
      <div class="navbar-inner">
        <div class="brand">
          <div>Panel de Administración</div>
        </div>
        
        <div class="admin-controls">
          <div class="nav-links">
            <a href="#/admin/usuarios" class="admin-link">
              <span class="icon">👥</span>
              Usuarios
            </a>
            <a href="#/admin/reportes" class="admin-link">
              <span class="icon">📊</span>
              Reportes
            </a>
            <a href="#/admin/configuracion" class="admin-link">
              <span class="icon">⚙️</span>
              Configuración
            </a>
            <a href="#/admin/sistema" class="admin-link">
              <span class="icon">🔧</span>
              Sistema
            </a>
          </div>
          
          <div class="admin-info">
            <div class="user-avatar admin-avatar">
              ${currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div class="user-details">
              <p class="user-name">${currentUser.name}</p>
              <p class="user-role admin-role">Administrador</p>
            </div>
            <div class="weather-widget" id="weather-admin"></div>
            <button id="logout-admin" class="btn-logout admin-logout">
              <span class="logout-icon">🔐</span>
              Salir
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Función para renderizar el navbar personalizado de visitantes
function renderVisitorNavbar(currentUser) {
  return `
    <div class="visitor-navbar">
      <div class="navbar-inner">
        <div class="brand">
          <div>Portal de Visitantes</div>
        </div>
        
        <div class="visitor-controls">
          <div class="nav-links">
            <a href="#/visitantes/informacion" class="visitor-link">
              <span class="icon">ℹ️</span>
              Información
            </a>
            <a href="#/visitantes/eventos" class="visitor-link">
              <span class="icon">📅</span>
              Eventos
            </a>
            <a href="#/visitantes/contacto" class="visitor-link">
              <span class="icon">📞</span>
              Contacto
            </a>
          </div>
          
          <div class="visitor-info">
            <div class="user-avatar visitor-avatar">
              ${currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div class="user-details">
              <p class="user-name">${currentUser.name}</p>
              <p class="user-role visitor-role">Visitante</p>
            </div>
            <div class="weather-widget" id="weather-visitor"></div>
            <button id="logout-visitor" class="btn-logout visitor-logout">
              <span class="logout-icon">👋</span>
              Salir
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}