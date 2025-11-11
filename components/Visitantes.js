import { createReserva, listReservas, updateUser } from '../js/db.js';

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
                <span class="badge" style="background: rgba(34, 197, 94, 0.2); color: #15803d;">
                  ✅ Activo
                </span>
              </div>
              <div class="profile-row">
                <strong>Código:</strong>
                <span class="badge" style="background: rgba(52, 152, 219, 0.2); color: #1b6ea8;">
                  ${currentUser?.userCode || (currentUser ? `UV-${currentUser.id}` : '—')}
                </span>
              </div>
              <div class="profile-row" style="display:flex; flex-direction:column; align-items:flex-start; gap:8px;">
                <strong>Mi QR</strong>
                <img alt="QR del visitante" style="width:140px;height:140px;border-radius:12px;border:1px solid rgba(255,255,255,0.12);"
                  src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(currentUser?.userCode || (currentUser ? `UV-${currentUser.id}` : ''))}" />
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
          <div class="visit-history">
            <div class="history-item orange">
              <div class="history-header">
                <span class="history-icon">📥</span>
                <strong>Visita registrada</strong>
              </div>
              <div class="small">Hoy, 09:00 AM - Visita Académica</div>
            </div>
            <div class="history-item blue">
              <div class="history-header">
                <span class="history-icon">📤</span>
                <strong>Salida registrada</strong>
              </div>
              <div class="small">Ayer, 16:45 PM</div>
            </div>
          </div>
        </div>
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
            <span class="badge" style="background: rgba(34, 197, 94, 0.2); color: #15803d;">
              ✅ Activo
            </span>
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
      } catch (err) {
        showModal('Error al actualizar perfil: ' + err.message, 'error');
      }
    });

    window.cancelEdit = function() {
      profileDiv.innerHTML = originalHTML;
    };
  };
}