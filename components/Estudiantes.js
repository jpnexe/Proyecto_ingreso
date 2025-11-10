import { listAnnouncements, listEntriesByUser, getLastEntryForUser } from '../js/db.js';

export function render({ currentUser }) {
  return `
    <div class="container">
        <div class="grid cols-3">
                <!-- Profile Card -->
                <div class="glass card">
                    <div class="section-title">👤 Información Académica</div>
                    
                    <div id="student-profile">
                        <div style="margin-bottom: 12px;">
                            <strong>ID Estudiantil:</strong> ${currentUser?.id || '20231045'}
                        </div>
                        <div style="margin-bottom: 12px;">
                            <strong>Código visible:</strong> <span id="student-code">${currentUser?.userCode || (currentUser?.id ? ('UG-'+currentUser.id) : 'UG-20231045')}</span>
                        </div>
                        <div style="margin-bottom: 12px;">
                            <strong>Semestre Actual:</strong> 4to Semestre
                        </div>
                        <div style="margin-bottom: 12px;">
                            <strong>Email Institucional:</strong> ${currentUser?.email || 'estudiante@uniguajira.edu.co'}
                        </div>
                        <div style="margin-bottom: 12px;">
                            <strong>Estado:</strong> 
                            <span class="badge" style="background: rgba(34, 197, 94, 0.2); color: #15803d;">
                                ✅ Activo
                            </span>
                        </div>
                        <button class="btn btn-blue" onclick="editProfile()" style="width: 100%; margin-top: 15px;">
                            ✏️ Editar Información
                        </button>
                    </div>
                </div>
                
                <!-- Credencial de Ingreso (QR) -->
                <div class="glass card">
                    <div class="section-title">📱 Credencial de Ingreso</div>
                    
                    <div style="text-align: center; margin-bottom: 20px;">
                        <div style="background: white; padding: 15px; border-radius: 10px; margin-bottom: 15px; display: inline-block;">
                            <img id="student-qr-img" src="" alt="QR Ingreso" style="width: 160px; height: 160px;">
                        </div>
                        <div style="margin-top:8px; font-size: 0.9em; color: #555;">Escanéalo en administración para registrar tu ingreso.</div>
                        <br>
                        <button class="btn btn-orange" onclick="downloadCredential()">
                            📲 Descargar credencial
                        </button>
                    </div>
                    
                    <div class="glass" style="padding: 15px; margin-top: 15px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <span><strong>Estado Actual:</strong></span>
                            <span class="badge" style="background: rgba(34, 197, 94, 0.2); color: #15803d;">
                                ✅ Dentro del campus
                            </span>
                        </div>
                        <div class="small">
                            Último registro: <strong id="last-entry">—</strong>
                        </div>
                    </div>
                </div>
                
                <!-- Attendance History -->
                <div class="glass card">
                    <div class="section-title">📋 Historial de Ingreso</div>
                    
                    <div id="entry-history" style="max-height: 300px; overflow-y: auto;"></div>
                </div>
            </div>
            
            <!-- Current Schedule -->
            <div class="glass card" style="margin-top: 20px;">
                <div class="section-title">📅 Horario Semanal</div>
                
                <div style="overflow-x: auto;">
                    <table class="table">
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
                                <td>Algoritmos</td>
                                <td></td>
                                <td>Algoritmos</td>
                                <td></td>
                                <td>Algoritmos</td>
                            </tr>
                            <tr>
                                <td><strong>10:00 - 12:00</strong></td>
                                <td>Bases de Datos</td>
                                <td>Bases de Datos</td>
                                <td></td>
                                <td>Bases de Datos</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td><strong>14:00 - 16:00</strong></td>
                                <td></td>
                                <td>Redes</td>
                                <td>Redes</td>
                                <td></td>
                                <td>Redes</td>
                            </tr>
                            <tr>
                                <td><strong>16:00 - 18:00</strong></td>
                                <td>Inteligencia Artificial</td>
                                <td></td>
                                <td>Inteligencia Artificial</td>
                                <td></td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- Announcements Section -->
            <div class="glass card" style="margin-top: 20px;">
                <div class="section-title">📢 Anuncios Académicos</div>
                <div id="announcements">
                    <!-- Los anuncios se cargarán aquí -->
                </div>
            </div>
        </div>
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
      wrap.innerHTML = '<div class="small" style="padding: 12px; color:#666;">Sin registros de ingreso aún.</div>';
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