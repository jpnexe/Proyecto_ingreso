import { listAnnouncements, listEntriesByUser, getLastEntryForUser } from '../js/db.js';

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
                <div class="profile-row"><strong>Semestre Actual:</strong> 4to Semestre</div>
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
        <div class="section-title">📅 Horario Semanal</div>
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
            <tbody>
              <tr>
                <td><strong>08:00 - 10:00</strong></td>
                <td><span class="course-chip">Algoritmos</span></td>
                <td></td>
                <td><span class="course-chip">Algoritmos</span></td>
                <td></td>
                <td><span class="course-chip">Algoritmos</span></td>
              </tr>
              <tr>
                <td><strong>10:00 - 12:00</strong></td>
                <td><span class="course-chip alt">Bases de Datos</span></td>
                <td><span class="course-chip alt">Bases de Datos</span></td>
                <td></td>
                <td><span class="course-chip alt">Bases de Datos</span></td>
                <td></td>
              </tr>
              <tr>
                <td><strong>14:00 - 16:00</strong></td>
                <td></td>
                <td><span class="course-chip blue">Redes</span></td>
                <td><span class="course-chip blue">Redes</span></td>
                <td></td>
                <td><span class="course-chip blue">Redes</span></td>
              </tr>
              <tr>
                <td><strong>16:00 - 18:00</strong></td>
                <td><span class="course-chip green">Inteligencia Artificial</span></td>
                <td></td>
                <td><span class="course-chip green">Inteligencia Artificial</span></td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
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
  `;
}

export function mount({ currentUser, navigate, toast }) {
  // Cargar anuncios
  loadAnnouncements();
  
  // Configurar funciones globales
  window.downloadCredential = downloadCredential;
  window.editProfile = editProfile;

  // Poblar credencial y historial de ingresos
  populateStudentCredentials(currentUser);
  loadEntryHistory(currentUser);
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
      const isIn = (e.method||'manual') !== 'salida';
      const color = isIn ? 'var(--orange)' : 'var(--blue)';
      const bg = isIn ? 'rgba(255, 127, 80, 0.1)' : 'rgba(52, 152, 219, 0.1)';
      const icon = isIn ? '📥' : '📤';
      const label = isIn ? 'Entrada registrada' : 'Salida registrada';
      const when = new Date(e.createdAt).toLocaleString('es-ES');
      return `
        <div style="margin-bottom: 15px; padding: 12px; background: ${bg}; border-left: 4px solid ${color}; border-radius: 8px;">
          <div style="display: flex; align-items: center; margin-bottom: 5px;">
            <span style="background: ${color}; color: white; padding: 4px 8px; border-radius: 50%; margin-right: 10px; font-size: 12px;">${icon}</span>
            <strong>${label}</strong>
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