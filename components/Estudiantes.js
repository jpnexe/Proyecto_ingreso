import { listAnnouncements, listEntriesByUser, getLastEntryForUser } from '../js/db.js';

export function render({ currentUser }) {
  return `
  <div class="container" style="max-width: 90%; margin: 0 auto; padding: 20px;">
    <!-- Tarjeta de información y QR -->
    <div class="glass card" style="margin-bottom: 30px; padding: 30px; transform: translateZ(0); will-change: transform; backface-visibility: hidden; -webkit-transform: translateZ(0);">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; align-items: start; transform: translateZ(0); will-change: transform;">
        <!-- Información de usuario -->
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
            <h2 style="margin: 0; color: var(--text-primary); font-size: 1.5em; display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 1em;">👤</span>
              Información Académica
            </h2>
            <button onclick="editProfile()" style="background: transparent; border: none; color: var(--text-primary); cursor: pointer; display: flex; align-items: center; padding: 5px;">
              <span style="font-size: 1.2em;">✏️</span>
            </button>
          </div>
          <div style="display: flex; flex-direction: column; gap: 18px;">
            <div>
              <div style="color: var(--text-secondary); font-size: 0.9em; margin-bottom: 8px;"># ID Estudiantil</div>
              <div style="color: var(--text-primary); font-size: 1.1em;">${currentUser?.id || '20231045'}</div>
            </div>
            <div>
              <div style="color: var(--text-secondary); font-size: 0.9em; margin-bottom: 8px;">📚 Semestre</div>
              <div style="color: var(--text-primary); font-size: 1.1em;">${currentUser?.semester || '4to Semestre'}</div>
            </div>
            <div>
              <div style="color: var(--text-secondary); font-size: 0.9em; margin-bottom: 8px;">✉️ Correo</div>
              <div style="color: var(--text-primary); font-size: 1.1em;">${currentUser?.email || 'estudiante@uniguajira.edu.co'}</div>
            </div>
            <div>
              <div style="color: var(--text-secondary); font-size: 0.9em; margin-bottom: 8px;">🔵 Estado</div>
              <div>
                <span class="badge" style="background: rgba(34, 197, 94, 0.2); color: #15803d; padding: 4px 12px; border-radius: 20px; font-size: 0.9em;">Matriculado</span>
              </div>
            </div>
            <div>
              <div style="color: var(--text-secondary); font-size: 0.9em; margin-bottom: 8px;">Código visible</div>
              <div style="color: var(--text-primary); font-size: 1.1em;"><span id="student-code">${currentUser?.userCode || (currentUser?.id ? ('UG-'+currentUser.id) : 'UG-20231045')}</span></div>
            </div>
          </div>
        </div>
        <!-- QR Section -->
        <div style="text-align: center;">
          <div style="background: white; padding: 15px; border-radius: 10px; margin-bottom: 20px; display: inline-block;">
            <img id="student-qr-img" src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(currentUser?.userCode || (currentUser?.id ? ('UG-'+currentUser.id) : 'UG-20231045'))}" alt="QR Ingreso" style="width: 160px; height: 160px;">
          </div>
          <div style="margin-top:8px; font-size: 0.9em; color: #555;">Escanéalo en administración para registrar tu ingreso.</div>
          <div class="small" style="margin-top: 10px;">Último registro: <strong id="last-entry">—</strong></div>
          <button class="btn btn-orange" onclick="downloadCredential()" style="margin-top: 12px;">
            📲 Descargar credencial
          </button>
        </div>
      </div>
    </div>
    <!-- Attendance History -->
    <div class="glass card" style="margin-bottom: 20px;">
      <div class="section-title" style="margin-bottom: 25px;">📋 Historial de Ingreso</div>
      <div id="entry-history" style="max-height: 300px; overflow-y: auto;"></div>
    </div>
            
            <!-- Current Schedule -->
            <div class="glass card" style="
                margin: 40px auto;
                max-width: 90%;
                padding: 25px;
                transform: translateZ(0);
                will-change: transform;
                backface-visibility: hidden;
            ">
                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    transform: translateZ(0);
                    will-change: transform;
                ">
                    <div class="section-title" style="display: flex; align-items: center; gap: 10px; font-size: 1.3em;">
                        <span>📅</span>
                        <span>Horario Semanal</span>
                    </div>
                    <div style="color: var(--text-secondary); font-size: 0.9em;">
                        Semestre Académico 2025
                    </div>
                </div>
                
                <div style="
                    overflow-x: auto;
                    transform: translateZ(0);
                    will-change: transform;
                    backface-visibility: hidden;
                    -webkit-transform: translateZ(0);
                ">
                    <table class="table" style="
                        width: 100%;
                        border-collapse: separate;
                        border-spacing: 0;
                        font-size: 0.95em;
                        transform: translateZ(0);
                        will-change: transform;
                    ">
                        <thead>
                            <tr>
                                <th style="background: var(--bg-header); padding: 12px; color: var(--text-primary); font-weight: 500; text-align: left;">Hora</th>
                                <th style="background: var(--bg-header); padding: 12px; color: var(--text-primary); font-weight: 500; text-align: left;">Lunes</th>
                                <th style="background: var(--bg-header); padding: 12px; color: var(--text-primary); font-weight: 500; text-align: left;">Martes</th>
                                <th style="background: var(--bg-header); padding: 12px; color: var(--text-primary); font-weight: 500; text-align: left;">Miércoles</th>
                                <th style="background: var(--bg-header); padding: 12px; color: var(--text-primary); font-weight: 500; text-align: left;">Jueves</th>
                                <th style="background: var(--bg-header); padding: 12px; color: var(--text-primary); font-weight: 500; text-align: left;">Viernes</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="padding: 12px; color: var(--text-primary); font-weight: 500; background: var(--glass-bg);">08:00 - 10:00</td>
                                <td style="padding: 12px; background: var(--bg1);">Algoritmos</td>
                                <td style="padding: 12px;"></td>
                                <td style="padding: 12px; background: var(--bg1);">Algoritmos</td>
                                <td style="padding: 12px;"></td>
                                <td style="padding: 12px; background: var(--bg1);">Algoritmos</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px; color: var(--text-primary); font-weight: 500; background: var(--glass-bg);">10:00 - 12:00</td>
                                <td style="padding: 12px; background: var(--bg2);">Bases de Datos</td>
                                <td style="padding: 12px; background: var(--bg2);">Bases de Datos</td>
                                <td style="padding: 12px;"></td>
                                <td style="padding: 12px; background: var(--bg2);">Bases de Datos</td>
                                <td style="padding: 12px;"></td>
                            </tr>
                            <tr>
                                <td style="padding: 12px; color: var(--text-primary); font-weight: 500; background: var(--glass-bg);">14:00 - 16:00</td>
                                <td style="padding: 12px;"></td>
                                <td style="padding: 12px; background: var(--bg3);">Redes</td>
                                <td style="padding: 12px; background: var(--bg3);">Redes</td>
                                <td style="padding: 12px;"></td>
                                <td style="padding: 12px; background: var(--bg3);">Redes</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px; color: var(--text-primary); font-weight: 500; background: var(--glass-bg);">16:00 - 18:00</td>
                                <td style="padding: 12px; background: var(--bg2);">Inteligencia Artificial</td>
                                <td style="padding: 12px;"></td>
                                <td style="padding: 12px; background: var(--bg2);">Inteligencia Artificial</td>
                                <td style="padding: 12px;"></td>
                                <td style="padding: 12px;"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- Announcements Section -->
            <div class="glass card" style="margin-top: 40px; margin-bottom: 40px;">
                <div class="section-title" style="margin-bottom: 25px;">
                    <span style="font-size: 1.5em;">📢</span>
                    <span style="margin-left: 10px;">Anuncios Académicos</span>
                </div>
                <div id="announcements" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 25px; padding: 15px;">
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
      announcementCard.style.cssText = `
        height: 100%;
        padding: 20px;
        border-radius: 15px;
        background: rgba(255, 255, 255, 0.05);
        border-left: 4px solid #4CAF50;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease-in-out;
        position: relative;
        cursor: pointer;
      `;

      // Agregar efectos hover
      announcementCard.addEventListener('mouseenter', () => {
        announcementCard.style.transform = 'translateY(-10px)';
        announcementCard.style.boxShadow = '0 10px 20px rgba(0,0,0,0.2)';
        announcementCard.style.background = 'linear-gradient(135deg, rgba(52, 152, 219, 0.3), rgba(52, 152, 219, 0.2))';
      });

      announcementCard.addEventListener('mouseleave', () => {
        announcementCard.style.transform = 'translateY(0)';
        announcementCard.style.boxShadow = 'none';
        announcementCard.style.background = 'linear-gradient(135deg, rgba(52, 152, 219, 0.2), rgba(52, 152, 219, 0.1))';
      });

      const isImportant = announcement.title.toLowerCase().includes('inicio de semestre');
      const importantBadge = isImportant ? '<span style="background: rgba(231, 76, 60, 0.2); color: #e74c3c; padding: 3px 8px; border-radius: 12px; font-size: 0.75em; margin-left: 10px;">IMPORTANTE</span>' : '';

      announcementCard.innerHTML = `
        <div style="position: relative;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
            <div>
              <h3 style="color: white; margin: 0 0 5px 0; font-size: 1.3em; font-weight: 600;">
                ${announcement.title}
              </h3>
              ${importantBadge ? `
                <div style="margin-top: 8px;">
                  <span style="background: rgba(231, 76, 60, 0.2); color: #e74c3c; padding: 4px 12px; border-radius: 12px; font-size: 0.75em;">
                    IMPORTANTE
                  </span>
                </div>
              ` : ''}
            </div>
            <span style="background: rgba(255, 255, 255, 0.08); color: rgba(255, 255, 255, 0.7); padding: 6px 12px; border-radius: 8px; font-size: 0.9em;">
              ${new Date(announcement.createdAt).toLocaleDateString('es-ES')}
            </span>
          </div>
          <p style="color: rgba(255, 255, 255, 0.8); margin-bottom: 20px; line-height: 1.6; font-size: 0.95em;">
            ${announcement.title.toLowerCase().includes('inicio de semestre') ? 
              'El segundo semestre académico de 2025 en la Universidad de La Guajira (Uniguajira) para el programa de Ingeniería de Sistemas ya está en curso. Te recordamos consultar tu horario actualizado.' :
              (announcement.title.toLowerCase().includes('biblioteca') ? 
              'Nueva sala de estudio disponible. La biblioteca está abierta en horario extendido para apoyar tus actividades académicas.' :
              announcement.body || 'Sin descripción disponible')
            }
          </p>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 15px;">
          ${announcement.title.toLowerCase().includes('inicio de semestre') ? `
            <div class="info-box" onmouseenter="this.style.transform='scale(1.02)'; this.style.background='rgba(255, 255, 255, 0.08)'" 
                 onmouseleave="this.style.transform='scale(1)'; this.style.background='rgba(255, 255, 255, 0.05)'"
                 style="background: rgba(255, 255, 255, 0.05); padding: 12px; border-radius: 10px; display: flex; align-items: center; gap: 12px; transition: all 0.3s ease;">
              <span style="font-size: 1.2em; opacity: 0.9;">🎓</span>
              <div>
                <div style="font-size: 0.8em; color: rgba(255, 255, 255, 0.5); margin-bottom: 2px;">Inicio de clases</div>
                <div style="color: white; font-weight: 500; font-size: 0.95em;">11 de Agosto, 2025</div>
              </div>
            </div>
            <div class="info-box" onmouseenter="this.style.transform='scale(1.02)'; this.style.background='rgba(255, 255, 255, 0.08)'" 
                 onmouseleave="this.style.transform='scale(1)'; this.style.background='rgba(255, 255, 255, 0.05)'"
                 style="background: rgba(255, 255, 255, 0.05); padding: 12px; border-radius: 10px; display: flex; align-items: center; gap: 12px; transition: all 0.3s ease;">
              <span style="font-size: 1.2em; opacity: 0.9;">📚</span>
              <div>
                <div style="font-size: 0.8em; color: rgba(255, 255, 255, 0.5); margin-bottom: 2px;">Fin de clases</div>
                <div style="color: white; font-weight: 500; font-size: 0.95em;">5 de Diciembre, 2025</div>
              </div>
            </div>
            <div class="info-box" onmouseenter="this.style.transform='scale(1.02)'; this.style.background='rgba(255, 255, 255, 0.08)'" 
                 onmouseleave="this.style.transform='scale(1)'; this.style.background='rgba(255, 255, 255, 0.05)'"
                 style="background: rgba(255, 255, 255, 0.05); padding: 12px; border-radius: 10px; display: flex; align-items: center; gap: 12px; transition: all 0.3s ease;">
              <span style="font-size: 1.2em; opacity: 0.9;">⏱️</span>
              <div>
                <div style="font-size: 0.8em; color: rgba(255, 255, 255, 0.5); margin-bottom: 2px;">Duración</div>
                <div style="color: white; font-weight: 500; font-size: 0.95em;">16 semanas</div>
              </div>
            </div>
          ` : ''}
          ${announcement.title.toLowerCase().includes('biblioteca') ? `
            <div class="info-box" onmouseenter="this.style.transform='scale(1.02)'; this.style.background='rgba(255, 255, 255, 0.08)'" 
                 onmouseleave="this.style.transform='scale(1)'; this.style.background='rgba(255, 255, 255, 0.05)'"
                 style="background: rgba(255, 255, 255, 0.05); padding: 12px; border-radius: 10px; display: flex; align-items: center; gap: 12px; transition: all 0.3s ease;">
              <span style="font-size: 1.2em; opacity: 0.9;">⏰</span>
              <div>
                <div style="font-size: 0.8em; color: rgba(255, 255, 255, 0.5); margin-bottom: 2px;">Horario mañana</div>
                <div style="color: white; font-weight: 500; font-size: 0.95em;">8:00 AM - 12:00 PM</div>
              </div>
            </div>
            <div class="info-box" onmouseenter="this.style.transform='scale(1.02)'; this.style.background='rgba(255, 255, 255, 0.08)'" 
                 onmouseleave="this.style.transform='scale(1)'; this.style.background='rgba(255, 255, 255, 0.05)'"
                 style="background: rgba(255, 255, 255, 0.05); padding: 12px; border-radius: 10px; display: flex; align-items: center; gap: 12px; transition: all 0.3s ease;">
              <span style="font-size: 1.2em; opacity: 0.9;">⏰</span>
              <div>
                <div style="font-size: 0.8em; color: rgba(255, 255, 255, 0.5); margin-bottom: 2px;">Horario tarde</div>
                <div style="color: white; font-weight: 500; font-size: 0.95em;">2:00 PM - 6:00 PM</div>
              </div>
            </div>
            <div class="info-box" onmouseenter="this.style.transform='scale(1.02)'; this.style.background='rgba(255, 255, 255, 0.08)'" 
                 onmouseleave="this.style.transform='scale(1)'; this.style.background='rgba(255, 255, 255, 0.05)'"
                 style="background: rgba(255, 255, 255, 0.05); padding: 12px; border-radius: 10px; display: flex; align-items: center; gap: 12px; transition: all 0.3s ease;">
              <span style="font-size: 1.2em; opacity: 0.9;">📚</span>
              <div>
                <div style="font-size: 0.8em; color: rgba(255, 255, 255, 0.5); margin-bottom: 2px;">Nuevo espacio</div>
                <div style="color: white; font-weight: 500; font-size: 0.95em;">Sala de estudio</div>
              </div>
            </div>
          ` : ''}
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px;">
          <span style="
            background: rgba(46, 204, 113, 0.2);
            color: #2ecc71;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.9em;
            display: flex;
            align-items: center;
            gap: 5px;
          ">
            <span style="font-size: 1.1em;">📚</span> Académico
          </span>
          <span class="notification-bell" style="cursor: pointer;">🔔</span>
        </div>
          <span class="notification-bell" style="cursor: pointer;">🔔</span>
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