import { mountWeather } from './Weather.js';

export function renderNavbar(currentUser, activeRoute) {
  const isActive = (r) => (activeRoute === r ? 'active' : '');
  
  // Si el usuario está logueado y está en la sección de estudiantes, mostrar navbar personalizado
  if (currentUser && activeRoute === 'estudiantes') {
    return renderStudentNavbar(currentUser);
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

export function mountNavbar(currentUser, navigate, toast, activeRoute) {
  // Si estamos en la sección de estudiantes, montar funcionalidad específica
  if (currentUser && activeRoute === 'estudiantes') {
    mountStudentNavbar(currentUser, navigate, toast);
    return;
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