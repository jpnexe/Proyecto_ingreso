import { getUserStats, listUsers, updateUser } from '../js/db.js';

export function render({ currentUser }) {
  return `
    <div class="uniguajira-login-container">
      <div class="uniguajira-main">
        <div class="uniguajira-content" style="grid-template-columns: 1fr;">
          <section class="grid cols-3">
            <div class="glass card">
              <div class="section-title">Estadísticas</div>
              <div id="kpis" class="grid cols-2">
                <div class="kpi glass">
                  <span class="badge">Total</span>
                  <span class="num" id="kpi-total">—</span>
                </div>
                <div class="kpi glass">
                  <span class="badge role-admin">Admins</span>
                  <span class="num" id="kpi-admins">—</span>
                </div>
                <div class="kpi glass">
                  <span class="badge role-estudiante">Estudiantes</span>
                  <span class="num" id="kpi-estudiantes">—</span>
                </div>
                <div class="kpi glass">
                  <span class="badge role-visitante">Visitantes</span>
                  <span class="num" id="kpi-visitantes">—</span>
                </div>
              </div>
            </div>
            <div class="glass card" style="grid-column: span 3;">
              <div class="section-title">Usuarios</div>
              <div class="form" style="margin-bottom:8px;">
                <input id="user-filter" class="input" placeholder="Buscar por nombre o correo" />
              </div>
              <div class="glass">
                <table class="table" id="users-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Correo</th>
                      <th>Rol</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody id="users-body"></tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  `;
}

export function mount({ showModal }) {
  let usersCache = [];

  async function refreshKpis() {
    const s = await getUserStats();
    document.getElementById('kpi-total').textContent = s.total;
    document.getElementById('kpi-admins').textContent = s.admins;
    document.getElementById('kpi-estudiantes').textContent = s.estudiantes;
    document.getElementById('kpi-visitantes').textContent = s.visitantes;
  }

  async function loadUsers() {
    usersCache = await listUsers();
    renderUsers(usersCache);
  }

  function renderUsers(list) {
    const tbody = document.getElementById('users-body');
    tbody.innerHTML = '';
    for (const u of list) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><input class="input" value="${u.name}" data-field="name" data-id="${u.id}"/></td>
        <td><input class="input" value="${u.email}" data-field="email" data-id="${u.id}"/></td>
        <td>
          <select class="input" data-field="role" data-id="${u.id}">
            <option value="admin" ${u.role==='admin'?'selected':''}>admin</option>
            <option value="estudiante" ${u.role==='estudiante'?'selected':''}>estudiante</option>
            <option value="visitante" ${u.role==='visitante'?'selected':''}>visitante</option>
          </select>
        </td>
        <td>
          <button class="btn btn-green" data-action="save" data-id="${u.id}">Guardar</button>
        </td>
      `;
      tbody.appendChild(tr);
    }
    bindActions();
  }

  function bindActions() {
    const buttons = document.querySelectorAll('button[data-action="save"]');
    buttons.forEach((b) => {
      b.addEventListener('click', async () => {
        const id = Number(b.dataset.id);
        const name = document.querySelector(`input[data-id="${id}"][data-field="name"]`).value;
        const email = document.querySelector(`input[data-id="${id}"][data-field="email"]`).value;
        const role = document.querySelector(`select[data-id="${id}"][data-field="role"]`).value;
        try {
          await updateUser(id, { name, email, role });
          showModal('Usuario actualizado', 'success');
          await refreshKpis();
        } catch (err) {
          showModal(err.message || 'Error al actualizar', 'error');
        }
      });
    });
  }

  document.getElementById('user-filter').addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    const filtered = usersCache.filter((u) =>
      (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q)
    );
    renderUsers(filtered);
  });

  // Funcionalidad del menú hamburguesa
  const hamburger = document.getElementById('mobile-hamburger');
  const mobileMenu = document.getElementById('mobile-nav-menu');
  
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      mobileMenu.classList.toggle('active');
      hamburger.classList.toggle('active');
    });

    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', (e) => {
      if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
        mobileMenu.classList.remove('active');
        hamburger.classList.remove('active');
      }
    });

    // Cerrar menú al hacer clic en un enlace
    const mobileNavItems = mobileMenu.querySelectorAll('.mobile-nav-item');
    mobileNavItems.forEach(item => {
      item.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        hamburger.classList.remove('active');
      });
    });
  }

  // "Tiempo real" simple: refrescar periódicamente y en cambios
  const interval = setInterval(refreshKpis, 1000);
  window.addEventListener('dbchange', refreshKpis);
  loadUsers();
  refreshKpis();

  // Limpieza al salir (si se quisiera)
  // return () => clearInterval(interval);
}