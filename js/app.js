import { initDB } from './db.js';
import * as Login from '../components/Login.js';
import * as Register from '../components/Register.js';
import * as AdminDashboard from '../components/AdminDashboard.js';
import * as Estudiantes from '../components/Estudiantes.js';
import * as Visitantes from '../components/Visitantes.js';
import { renderNavbar, mountNavbar } from '../components/Navbar.js';

const app = document.getElementById('app');
const navbar = document.getElementById('navbar');

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('currentUser')) || null;
  } catch (e) {
    return null;
  }
}

function navigate(route) {
  if (!route.startsWith('#/')) route = `#/${route}`;
  location.hash = route;
}

function showModal(message, type = 'info', title = null) {
  const overlay = document.getElementById('modal-overlay');
  const dialog = document.getElementById('modal-dialog');
  const icon = document.getElementById('modal-icon');
  const titleElement = document.getElementById('modal-title');
  const messageElement = document.getElementById('modal-message');
  const closeBtn = document.getElementById('modal-close');
  const okBtn = document.getElementById('modal-ok');

  // Set content
  messageElement.textContent = message;
  
  // Set type-specific styles and content
  dialog.className = 'modal-dialog';
  if (type === 'error') {
    dialog.classList.add('error');
    icon.className = 'fas fa-exclamation-triangle';
    titleElement.textContent = title || 'Error';
  } else if (type === 'success') {
    dialog.classList.add('success');
    icon.className = 'fas fa-check-circle';
    titleElement.textContent = title || 'Éxito';
  } else if (type === 'warning') {
    dialog.classList.add('warning');
    icon.className = 'fas fa-exclamation-triangle';
    titleElement.textContent = title || 'Advertencia';
  } else {
    icon.className = 'fas fa-info-circle';
    titleElement.textContent = title || 'Información';
  }

  // Show modal
  overlay.classList.add('show');
  
  // Close handlers
  const closeModal = () => {
    overlay.classList.remove('show');
  };
  
  closeBtn.onclick = closeModal;
  okBtn.onclick = closeModal;
  
  // Close on overlay click
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      closeModal();
    }
  };
  
  // Close on Escape key
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
}

const routes = {
  '': Login,
  'login': Login,
  'registro': Register,
  'register': Register,
  'admin': AdminDashboard,
  'estudiantes': Estudiantes,
  'visitantes': Visitantes,
};

function requiresAuth(route) {
  return ['admin', 'estudiantes', 'visitantes'].includes(route);
}

function canAccess(route, user) {
  if (!requiresAuth(route)) return true;
  if (!user) return false;
  if (route === 'admin') return user.role === 'admin';
  if (route === 'estudiantes') return user.role === 'estudiante';
  if (route === 'visitantes') return user.role === 'visitante';
  return false;
}

function getRouteFromHash() {
  const raw = location.hash.replace('#/', '').trim();
  return raw || '';
}

async function renderRoute() {
  const route = getRouteFromHash();
  const user = getCurrentUser();
  const Component = routes[route] || Login;

  // Navbar visible excepto en páginas de autenticación y panel admin (usa barra lateral propia)
  const showNav = !(['login', 'register', 'registro', '', 'admin'].includes(route));
  navbar.innerHTML = showNav ? renderNavbar(user, route) : '';
  if (showNav) mountNavbar(user, navigate, showModal, route);

  if (!canAccess(route, user)) {
    showModal('Acceso restringido. Inicia sesión con el rol adecuado.', 'error');
    navigate('login');
    return;
  }

  app.innerHTML = Component.render({ currentUser: user });
  if (typeof Component.mount === 'function') {
    Component.mount({ currentUser: user, navigate, showToast: showModal });
  }
}

window.addEventListener('hashchange', renderRoute);
window.addEventListener('dbchange', () => {
  // Simple auto-refresh for sections sensitive to DB changes
  renderRoute();
});

(async function bootstrap() {
  await initDB();
  if (!location.hash) navigate('login');
  renderRoute();
})();