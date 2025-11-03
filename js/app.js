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

function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = 'toast show';
  if (type === 'error') {
    toast.classList.add('error');
  } else if (type === 'success') {
    toast.classList.add('success');
  }
  setTimeout(() => {
    toast.classList.remove('show', 'error', 'success');
  }, 3000);
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

  // Navbar visible except on auth pages
  const showNav = !(['login', 'register', 'registro', ''].includes(route));
  navbar.innerHTML = showNav ? renderNavbar(user, route) : '';
  if (showNav) mountNavbar(user, navigate, showToast);

  if (!canAccess(route, user)) {
    showToast('Acceso restringido. Inicia sesión con el rol adecuado.');
    navigate('login');
    return;
  }

  app.innerHTML = Component.render({ currentUser: user });
  if (typeof Component.mount === 'function') {
    Component.mount({ currentUser: user, navigate, showToast });
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