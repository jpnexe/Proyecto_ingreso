import { createReserva, listReservas, updateUser, listEntriesByUser, ensureAutoExitForUser } from '../js/db.js';

export function render({ currentUser }) {
  return `
    <div class="uniguajira-visitors-container">
      <div class="uniguajira-main">
        <div class="visitor-toolbar glass">
          <div class="breadcrumbs">Visitantes › Reservas</div>
          <div class="toolbar-actions">
            <button class="btn btn-primary" id="new-reserva-btn">Nueva reserva</button>
            <button class="btn btn-outline" id="help-btn">Ayuda</button>
          </div>
        </div>

        <div class="visitor-layout">
          <!-- Columna izquierda: Perfil -->
          <aside class="glass card visitor-profile">
            <div class="section-title">👤 Perfil de Visitante</div>
            <div id="visitor-profile">
              <div class="profile-row">
                <strong>Nombre:</strong> ${currentUser?.name || 'Visitante'}
              </div>
              <div class="profile-row">
                <strong>Email:</strong> ${currentUser?.email || 'visitante@example.com'}
              </div>
              <div class="profile-row">
                <strong>Estado:</strong>
                <span id="visitor-status-badge" class="badge" style="background: rgba(160,160,160,0.2); color: #555;">—</span>
              </div>
              <div class="profile-row">
                <strong>Último registro:</strong>
                <span id="visitor-last-event" class="small">—</span>
              </div>
              <div class="profile-row">
                <strong>Código:</strong>
                <span class="badge" style="background: rgba(52, 152, 219, 0.2); color: #1b6ea8;">
                  ${currentUser?.userCode || (currentUser ? `UV-${currentUser.id}` : '—')}
                </span>
              </div>
              <div class="profile-row qr-section">
                <strong>Mi QR</strong>
                <img class="qr-code" alt="QR del visitante"
                  src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentUser?.userCode || (currentUser ? `UV-${currentUser.id}` : ''))}" />
                <button class="btn btn-outline btn-sm qr-fullscreen-btn" onclick="showQRFullscreen()">
                  📱 Ampliar QR
                </button>
              </div>
              <button class="btn btn-blue full-width" onclick="editProfile()">
                ✏️ Editar Información
              </button>
            </div>
          </aside>

          <!-- Columna central: Formulario de reservas -->
          <main class="glass card visitor-form-card">
            <div class="section-title">Apartar Reserva</div>
            <p class="form-subtitle">Completa el formulario para agendar tu visita</p>
            <form id="reserva-form" class="form">
              <div class="date-time-wrapper">
                <div class="form-group">
                  <label class="label" for="date">Fecha</label>
                  <input id="date" name="date" type="date" class="input" placeholder="dd/mm/aaaa" required />
                </div>
                <div class="form-group">
                  <label class="label" for="time">Hora</label>
                  <input id="time" name="time" type="time" class="input" placeholder="--:--" required />
                </div>
              </div>
              <div class="form-group">
                <label class="label" for="purpose">Propósito de Visita</label>
                <select id="purpose" name="purpose" class="input" required>
                  <option value="">Seleccionar propósito</option>
                  <option value="visita-academica">Visita Académica</option>
                  <option value="reunion">Reunión</option>
                  <option value="evento">Evento</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div class="form-group">
                <label class="label" for="description">Descripción</label>
                <textarea id="description" name="description" class="input" rows="3" placeholder="Describe el motivo de tu visita"></textarea>
              </div>
              <button type="submit" class="btn btn-primary">
                <span class="button-icon">Ⓖ</span> Apartar Reserva
              </button>
            </form>
          </main>

          <!-- Columna derecha: Mis reservas -->
          <aside class="glass card visitor-reservas-card">
            <div class="section-title">Mis Reservas</div>
            <div id="reservas-list" class="reservas-list"></div>
          </aside>
        </div>

        <!-- Sección inferior: Lugares y Contacto -->
        <section class="grid cols-2 mt-6">
          <div class="glass card">
            <div class="section-title">📍 Lugares</div>
            <div class="lugares-grid">
              <div class="lugar-item">
                <img src="https://images.unsplash.com/photo-1562774053-701939374585?w=300&h=200&fit=crop" alt="Biblioteca" class="lugar-img">
                <div class="lugar-info">
                  <h3>Biblioteca Central</h3>
                  <p>Espacio de estudio y consulta</p>
                </div>
              </div>
              <div class="lugar-item">
                <img src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=300&h=200&fit=crop" alt="Laboratorio" class="lugar-img">
                <div class="lugar-info">
                  <h3>Laboratorios</h3>
                  <p>Equipos especializados</p>
                </div>
              </div>
              <div class="lugar-item">
                <img src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=200&fit=crop" alt="Auditorio" class="lugar-img">
                <div class="lugar-info">
                  <h3>Auditorio</h3>
                  <p>Para eventos y conferencias</p>
                </div>
              </div>
              <div class="lugar-item">
                <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&h=200&fit=crop" alt="Cafetería" class="lugar-img">
                <div class="lugar-info">
                  <h3>Cafetería</h3>
                  <p>Zona de descanso y alimentación</p>
                </div>
              </div>
            </div>
          </div>

          <div class="glass card">
            <div class="section-title">ℹ️ Información de Contacto</div>
            <div class="contact-info">
              <div class="contact-item">
                <span class="contact-icon">📍</span>
                <span>Km 5 Vía Maicao, Riohacha - La Guajira</span>
              </div>
              <div class="contact-item">
                <span class="contact-icon">📞</span>
                <span>+57 (5) 728 7500</span>
              </div>
              <div class="contact-item">
                <span class="contact-icon">✉️</span>
                <span>info@uniguajira.edu.co</span>
              </div>
              <div class="contact-item">
                <span class="contact-icon">🌐</span>
                <span>www.uniguajira.edu.co</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Historial de visitas -->
        <div class="glass card mt-6">
          <div class="section-title">📋 Historial de Visitas</div>
          <div id="visit-history" class="visit-history"></div>
        </div>
      </div>
    </div>
    
    <!-- Modal QR Pantalla Completa -->
    <div id="qr-modal" class="qr-modal">
      <div class="qr-modal-content">
        <button class="qr-modal-close" onclick="closeQRModal()">&times;</button>
        <h3>Código QR de Visitante</h3>
        <img id="qr-fullscreen" alt="QR Visitante" />
        <p style="margin-top: 1rem; color: #666; font-size: 0.9rem;">
          Escanea este código para registrar tu visita
        </p>
      </div>
    </div>
  `;
}

export function mount({ currentUser, navigate, showToast }) {
  const showModal = showToast || ((msg) => alert(msg));
  const form = document.getElementById('reserva-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const purpose = document.getElementById('purpose').value;
    const description = document.getElementById('description').value;
    try {
      if (!currentUser) throw new Error('Debes iniciar sesión.');
      const iso = new Date(`${date}T${time}:00`).toISOString();
      const motivo = description ? `${purpose} - ${description}` : purpose;
      await createReserva({ userId: currentUser.id, dateISO: iso, motivo });
      showModal('Reserva creada exitosamente', 'success');
      form.reset();
      await loadReservas(currentUser.id);
    } catch (err) {
      showModal(err.message || 'Error al crear la reserva', 'error');
    }
  });

  async function loadReservas(userId) {
    const list = await listReservas(userId);
    const container = document.getElementById('reservas-list');
    container.innerHTML = '';
    for (const r of list) {
      const card = document.createElement('div');
      card.className = 'glass card';
      const d = new Date(r.date);
      card.innerHTML = `
        <div><strong>${r.day}</strong> · ${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        <div class="small">Motivo: ${r.motivo}</div>
      `;
      container.appendChild(card);
    }
  }

  if (currentUser) loadReservas(currentUser.id);

  async function loadVisitHistory(userId) {
    const wrap = document.getElementById('visit-history');
    if (!wrap || !userId) return;
    try {
      const list = await listEntriesByUser(userId, 50);
      if (!list.length) {
        wrap.innerHTML = '<div class="small" style="padding: 12px;">Sin registros aún.</div>';
        return;
      }
      wrap.innerHTML = list.map(e => {
        const method = String(e.method || 'manual');
        const isExit = method.startsWith('salida');
        const color = isExit ? 'var(--blue)' : 'var(--orange)';
        const bg = isExit ? 'rgba(52, 152, 219, 0.1)' : 'rgba(255, 127, 80, 0.1)';
        const icon = isExit ? '📤' : '📥';
        const baseLabel = isExit ? 'Salida registrada' : 'Entrada registrada';
        const note = method === 'salida_auto' ? ' · No registró salida' : '';
        const when = new Date(e.createdAt).toLocaleString('es-ES');
        return `
          <div style="margin-bottom: 15px; padding: 12px; background: ${bg}; border-left: 4px solid ${color}; border-radius: 8px;">
            <div style="display: flex; align-items: center; margin-bottom: 5px;">
              <span style="background: ${color}; color: white; padding: 4px 8px; border-radius: 50%; margin-right: 10px; font-size: 12px;">${icon}</span>
              <strong>${baseLabel}${note}</strong>
            </div>
            <div class="small">${when}</div>
          </div>`;
      }).join('');
    } catch (e) {
      wrap.innerHTML = '<div class="small" style="padding: 12px; color:#e74c3c;">Error cargando historial.</div>';
    }
  }

  async function updateVisitorStatus(userId) {
    const badge = document.getElementById('visitor-status-badge');
    const lastEl = document.getElementById('visitor-last-event');
    if (!badge || !userId) return;
    try {
      await ensureAutoExitForUser(userId);
      const list = await listEntriesByUser(userId, 1);
      if (!list.length) {
        badge.textContent = 'Sin registros';
        badge.style.background = 'rgba(160,160,160,0.2)';
        badge.style.color = '#555';
        if (lastEl) lastEl.textContent = '—';
        return;
      }
      const last = list[0];
      const isExit = String(last.method || 'manual').startsWith('salida');
      if (isExit) {
        badge.textContent = 'Fuera';
        badge.style.background = 'rgba(52, 152, 219, 0.2)';
        badge.style.color = '#1b6ea8';
      } else {
        badge.textContent = 'Dentro';
        badge.style.background = 'rgba(34, 197, 94, 0.2)';
        badge.style.color = '#15803d';
      }
      if (lastEl) lastEl.textContent = new Date(last.createdAt).toLocaleString('es-ES');
    } catch (e) {
      badge.textContent = '—';
      badge.style.background = 'rgba(160,160,160,0.2)';
      badge.style.color = '#555';
      if (lastEl) lastEl.textContent = '—';
    }
  }

  if (currentUser?.id) {
    updateVisitorStatus(currentUser.id);
    loadVisitHistory(currentUser.id);
  }

  // Función para mostrar QR en pantalla completa
  window.showQRFullscreen = function() {
    const qrModal = document.getElementById('qr-modal');
    const qrImage = document.getElementById('qr-fullscreen');
    const codeVal = currentUser?.userCode || (currentUser ? `UV-${currentUser.id}` : '');
    
    qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(codeVal)}`;
    qrModal.classList.add('active');
    
    // Cerrar con ESC
    document.addEventListener('keydown', closeQRModalOnEsc);
    
    // Cerrar al hacer clic fuera
    qrModal.addEventListener('click', function(e) {
      if (e.target === qrModal) {
        closeQRModal();
      }
    });
  };

  // Función para cerrar modal QR
  window.closeQRModal = function() {
    const qrModal = document.getElementById('qr-modal');
    qrModal.classList.remove('active');
    document.removeEventListener('keydown', closeQRModalOnEsc);
  };

  // Cerrar modal con ESC
  function closeQRModalOnEsc(event) {
    if (event.key === 'Escape') {
      closeQRModal();
    }
  };

  // Función para editar perfil
  window.editProfile = function() {
    const profileDiv = document.getElementById('visitor-profile');
    const originalHTML = profileDiv.innerHTML;
    
    // Crear formulario de edición
    profileDiv.innerHTML = `
      <form id="edit-profile-form">
        <div style="margin-bottom: 12px;">
          <strong>Nombre:</strong>
          <input type="text" value="${currentUser.name}" id="edit-name" required>
        </div>
        <div style="margin-bottom: 12px;">
          <strong>Email:</strong>
          <input type="email" value="${currentUser.email}" id="edit-email" required>
        </div>
        <button type="submit" class="btn btn-green full-width">Guardar</button>
        <button type="button" onclick="cancelEdit()" class="btn btn-red full-width">Cancelar</button>
      </form>
    `;

    const editForm = document.getElementById('edit-profile-form');
    editForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newName = document.getElementById('edit-name').value;
      const newEmail = document.getElementById('edit-email').value;
      
      try {
        await updateUser(currentUser.id, { name: newName, email: newEmail });
        localStorage.setItem('currentUser', JSON.stringify({ ...currentUser, name: newName, email: newEmail }));
        showModal('Perfil actualizado exitosamente', 'success');
        // Re-renderizar el perfil
        const codeVal = (currentUser.userCode || `UV-${currentUser.id}`);
        profileDiv.innerHTML = `
          <div class="profile-row">
            <strong>Nombre:</strong> ${newName}
          </div>
          <div class="profile-row">
            <strong>Email:</strong> ${newEmail}
          </div>
          <div class="profile-row">
            <strong>Estado:</strong>
            <span id="visitor-status-badge" class="badge" style="background: rgba(160,160,160,0.2); color: #555;">—</span>
          </div>
          <div class="profile-row">
            <strong>Último registro:</strong>
            <span id="visitor-last-event" class="small">—</span>
          </div>
          <div class="profile-row">
            <strong>Código:</strong>
            <span class="badge" style="background: rgba(52, 152, 219, 0.2); color: #1b6ea8;">${codeVal}</span>
          </div>
          <div class="profile-row" style="display:flex; flex-direction:column; align-items:flex-start; gap:8px;">
            <strong>Mi QR</strong>
            <img alt="QR del visitante" style="width:140px;height:140px;border-radius:12px;border:1px solid rgba(255,255,255,0.12);"
              src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(codeVal)}" />
          </div>
          <button class="btn btn-blue full-width" onclick="editProfile()" style="margin-top: 15px;">
            ✏️ Editar Información
          </button>
        `;
        updateVisitorStatus(currentUser.id);
      } catch (err) {
        showModal('Error al actualizar perfil: ' + err.message, 'error');
      }
    });

    window.cancelEdit = function() {
      profileDiv.innerHTML = originalHTML;
    };
  };
}