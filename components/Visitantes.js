import { createReserva, listReservas } from '../js/db.js';

export function render({ currentUser }) {
  return `
    <div class="uniguajira-login-container">
      <div class="uniguajira-main">
        <div class="uniguajira-content" style="grid-template-columns: 1fr;">
          <section class="grid cols-2">
            <div class="glass card">
              <div class="section-title">Apartar reserva</div>
              <form id="reserva-form" class="form">
                <div>
                  <label class="label" for="date">Fecha</label>
                  <input id="date" name="date" type="date" class="input" required />
                </div>
                <div>
                  <label class="label" for="time">Hora</label>
                  <input id="time" name="time" type="time" class="input" required />
                </div>
                <div>
                  <label class="label" for="purpose">Propósito</label>
                  <select id="purpose" name="purpose" class="input" required>
                    <option value="">Seleccionar propósito</option>
                    <option value="visita-academica">Visita Académica</option>
                    <option value="reunion">Reunión</option>
                    <option value="evento">Evento</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label class="label" for="description">Descripción</label>
                  <textarea id="description" name="description" class="input" rows="3" placeholder="Describe el motivo de tu visita"></textarea>
                </div>
                <button type="submit" class="btn btn-primary">Apartar Reserva</button>
              </form>
            </div>
            
            <div class="glass card">
              <div class="section-title">Mis Reservas</div>
              <div id="reservas-list" class="reservas-list">
                <!-- Las reservas se cargarán aquí -->
              </div>
            </div>
          </section>
          
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
        </div>
      </div>
    </div>
  `;
}

export function mount({ currentUser, showModal }) {
  const form = document.getElementById('reserva-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const motivo = document.getElementById('motivo').value;
    try {
      if (!currentUser) throw new Error('Debes iniciar sesión.');
      const iso = new Date(`${date}T${time}:00`).toISOString();
      await createReserva({ userId: currentUser.id, dateISO: iso, motivo });
      showModal('Reserva creada', 'success');
      await loadReservas(currentUser.id);
    } catch (err) {
      showModal(err.message || 'Error al reservar', 'error');
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
}