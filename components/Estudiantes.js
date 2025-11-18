import { listAnnouncements, listEntriesByUser, getLastEntryForUser, ensureAutoExitForUser, getAssignedScheduleForUser } from '../js/db.js';

export function render({ currentUser }) {
  return `
    <div class="uniguajira-students-container">
      <div class="students-toolbar glass">
        <div class="breadcrumbs">Estudiantes › Panel</div>
        <div class="toolbar-actions">
          <button class="btn btn-orange" onclick="downloadCredential()">📲 Descargar credencial</button>
        </div>
      </div>

      <div class="students-layout">
        <!-- Perfil Académico -->
        <aside class="glass card student-profile-card">
          <div class="section-title">👤 Información Académica</div>

          <div class="texture-pane">
            <div id="student-profile" class="student-profile-content student-profile-grid">
              <img class="student-photo-square" src="${currentUser?.photoUrl || './img/logo uniguajira.png'}" alt="Foto del estudiante" />
              <div class="student-profile-details">
                <div class="profile-row"><strong>ID Estudiantil:</strong> ${currentUser?.id || '20231045'}</div>
                <div class="profile-row"><strong>Código visible:</strong> <span id="student-code">${currentUser?.userCode || (currentUser?.id ? ('UG-'+currentUser.id) : 'UG-20231045')}</span></div>
                <div class="profile-row"><strong>Carrera:</strong> ${currentUser?.career || 'Sin carrera'}</div>
                <div class="profile-row"><strong>Semestre Actual:</strong> ${currentUser?.semester || '—'}</div>
                <div class="profile-row"><strong>Email Institucional:</strong> ${currentUser?.email || 'estudiante@uniguajira.edu.co'}</div>
                <div class="profile-row">
                  <strong>Estado:</strong>
                  <span class="badge" style="background: rgba(34, 197, 94, 0.2); color: #15803d;">✅ Activo</span>
                </div>
                <button class="btn btn-blue full-width" onclick="editProfile()" style="margin-top: 15px;">✏️ Editar Información</button>
              </div>
            </div>
          </div>
        </aside>

        <!-- Credencial de Ingreso (QR) -->
        <section class="glass card academic-info-card">
          <div class="section-title">📱 Credencial de Ingreso</div>

          <div class="texture-pane">
            <div class="credential-center">
              <div class="qr-wrap">
                <img id="student-qr-img" src="" alt="QR Ingreso" />
              </div>
              <div class="muted_small">Escanéalo en administración para registrar tu ingreso.</div>
              <button class="btn btn-orange" onclick="downloadCredential()" style="margin-top:10px;">📲 Descargar credencial</button>
              <button class="btn btn-outline btn-sm qr-fullscreen-btn" onclick="showStudentQRFullscreen()" style="margin-top:6px;">📱 Ampliar QR</button>
            </div>

            <div class="glass status-card">
              <div class="status-row">
                <span><strong>Estado Actual:</strong></span>
                <span class="badge" style="background: rgba(34, 197, 94, 0.2); color: #15803d;">✅ Dentro del campus</span>
              </div>
              <div class="small">Último registro: <strong id="last-entry">—</strong></div>
            </div>
          </div>
        </section>

        <!-- Historial de Ingreso -->
        <section class="glass card quick-access-card">
          <div class="section-title">📋 Historial de Ingreso</div>
          <div class="texture-pane">
            <div id="entry-history" class="entry-history"></div>
          </div>
        </section>
      </div>

      <!-- Horario Semanal -->
      <section class="glass card schedule-card">
        <div class="section-title">📅 Horario Semanal <span id="schedule-label" class="chip" style="margin-left:8px;">—</span></div>
        <div class="texture-pane">
        <div class="schedule-wrap">
          <table class="schedule-table">
            <thead>
              <tr>
                <th>Hora</th>
                <th>Lunes</th>
                <th>Martes</th>
                <th>Miércoles</th>
                <th>Jueves</th>
                <th>Viernes</th>
              </tr>
            </thead>
            <tbody id="schedule-body"></tbody>
          </table>
        </div>
        </div>
      </section>

      <!-- Anuncios Académicos -->
      <section class="glass card announcements-card">
        <div class="section-title">📢 Anuncios Académicos</div>
        <div id="announcements"></div>
      </section>
    </div>
    <div id="student-qr-modal" class="qr-modal">
      <div class="qr-modal-content">
        <button class="qr-modal-close" onclick="closeStudentQRModal()">&times;</button>
        <h3>Código QR de Estudiante</h3>
        <img id="student-qr-fullscreen" alt="QR Estudiante" />
        <p style="margin-top: 1rem; color: #666; font-size: 0.9rem;">Escanéalo en administración para registrar tu ingreso</p>
      </div>
    </div>
  `;
}

export async function mount({ currentUser, navigate, toast }) {
  // Cargar anuncios
  loadAnnouncements();
  
  // Configurar funciones globales
  window.downloadCredential = downloadCredential;
  window.editProfile = editProfile;

  // Poblar credencial y historial de ingresos
  populateStudentCredentials(currentUser);
  if (currentUser?.id) {
    try { await ensureAutoExitForUser(currentUser.id); } catch {}
  }
  loadEntryHistory(currentUser);
  loadAssignedSchedule(currentUser);

  function closeStudentQRModalOnEsc(event) {
    if (event.key === 'Escape') {
      closeStudentQRModal();
    }
  }
  window.showStudentQRFullscreen = function() {
    const modal = document.getElementById('student-qr-modal');
    const img = document.getElementById('student-qr-fullscreen');
    const codeVal = (currentUser?.userCode) || (currentUser ? `UG-${currentUser.id}` : '');
    if (img) img.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(codeVal)}`;
    if (modal) {
      modal.classList.add('active');
      document.addEventListener('keydown', closeStudentQRModalOnEsc);
      modal.addEventListener('click', function(e) { if (e.target === modal) closeStudentQRModal(); });
    }
  };
  window.closeStudentQRModal = function() {
    const modal = document.getElementById('student-qr-modal');
    if (modal) modal.classList.remove('active');
    document.removeEventListener('keydown', closeStudentQRModalOnEsc);
  };
}



async function loadAnnouncements() {
  const container = document.getElementById('announcements');
  
  try {
    const anns = await listAnnouncements();
    
    if (anns.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 20px; color: #666;">
          <p>No hay anuncios disponibles en este momento</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = '';
    anns.forEach(announcement => {
      const announcementCard = document.createElement('div');
      announcementCard.className = 'glass';
      announcementCard.style.cssText = 'margin-bottom: 15px; padding: 15px; border-radius: 10px;';
      announcementCard.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
          <h4 style="color: var(--primary-color); margin: 0; font-weight: bold;">${announcement.title}</h4>
          <span style="font-size: 0.9em; color: #888;">${new Date(announcement.createdAt).toLocaleDateString('es-ES')}</span>
        </div>
        <p style="color: #555; margin-bottom: 8px; line-height: 1.5;">${announcement.body || 'Sin descripción disponible'}</p>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="badge">📢 Académico</span>
          <span style="color: var(--orange); font-size: 1.2em;">🔔</span>
        </div>
      `;
      container.appendChild(announcementCard);
    });
    
  } catch (error) {
    container.innerHTML = `
      <div style="text-align: center; padding: 20px; color: #e74c3c;">
        <p>⚠️ Error al cargar los anuncios</p>
      </div>
    `;
  }
}

// Función para descargar credencial
function downloadCredential() {
  // Simular descarga de credencial
  const link = document.createElement('a');
  link.href = 'data:text/plain;charset=utf-8,Credencial Estudiantil - Universidad de La Guajira';
  link.download = 'credencial_estudiantil.txt';
  link.click();
  
  // Mostrar mensaje de confirmación
  alert('📱 Descarga iniciada. Tu credencial estudiantil se está descargando.');
}

function populateStudentCredentials(currentUser) {
  try {
    const code = (currentUser?.userCode) || (currentUser?.id ? `UG-${currentUser.id}` : 'UG-0000');
    const codeEl = document.getElementById('student-code');
    if (codeEl) codeEl.textContent = code;
    const img = document.getElementById('student-qr-img');
    if (img) img.src = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(code)}`;
    const lastEl = document.getElementById('last-entry');
    if (lastEl && currentUser?.id) {
      getLastEntryForUser(currentUser.id).then(ts => {
        lastEl.textContent = ts ? new Date(ts).toLocaleString('es-ES') : '—';
      }).catch(()=>{});
    }
  } catch (e) { /* noop */ }
}

async function loadEntryHistory(currentUser) {
  const wrap = document.getElementById('entry-history');
  if (!wrap || !currentUser?.id) return;
  try {
    const list = await listEntriesByUser(currentUser.id, 50);
    if (!list.length) {
      wrap.innerHTML = '<div class="small" style="padding: 12px;">Sin registros de ingreso aún.</div>';
      return;
    }
    wrap.innerHTML = list.map(e => {
      const method = String(e.method||'manual');
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

// Función para editar perfil
function editProfile() {
  alert('✏️ Función de edición de perfil en desarrollo');
}
function paintScheduleTable(schedule) {
  const tbody = document.getElementById('schedule-body');
  const labelEl = document.getElementById('schedule-label');
  if (!tbody) return;
  const rows = Array.isArray(schedule?.slots) ? schedule.slots : [];
  tbody.innerHTML = rows.map(r => {
    const cell = (v, cls) => v ? `<span class="course-chip${cls?(' '+cls):''}">${v}</span>` : '';
    return `
      <tr>
        <td><strong>${r.time || ''}</strong></td>
        <td>${cell(r['Lunes'], '')}</td>
        <td>${cell(r['Martes'], 'alt')}</td>
        <td>${cell(r['Miércoles'], 'blue')}</td>
        <td>${cell(r['Jueves'], '')}</td>
        <td>${cell(r['Viernes'], 'green')}</td>
      </tr>`;
  }).join('');
  if (labelEl) labelEl.textContent = schedule?.label || '—';
}

async function loadAssignedSchedule(currentUser) {
  try {
    if (!currentUser?.id) return;
    const sched = await getAssignedScheduleForUser(currentUser.id);
    if (sched) paintScheduleTable(sched);
  } catch {}
}