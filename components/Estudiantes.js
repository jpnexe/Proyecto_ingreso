import { listAnnouncements } from '../js/db.js';

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
                
                <!-- Schedule QR Card -->
                <div class="glass card">
                    <div class="section-title">🕒 Horario Académico</div>
                    
                    <div style="text-align: center; margin-bottom: 20px;">
                        <div style="background: white; padding: 15px; border-radius: 10px; margin-bottom: 15px; display: inline-block;">
                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://universidad.edu/horarios/${currentUser?.id || '20231045'}" 
                                 alt="QR Horario" style="width: 120px; height: 120px;">
                        </div>
                        <br>
                        <button class="btn btn-orange" onclick="downloadCredential()">
                            📱 Descargar QR
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
                            Último registro: <strong>Hoy, 08:15 AM</strong>
                        </div>
                    </div>
                </div>
                
                <!-- Attendance History -->
                <div class="glass card">
                    <div class="section-title">📋 Historial de Ingreso</div>
                    
                    <div style="max-height: 300px; overflow-y: auto;">
                        <div style="margin-bottom: 15px; padding: 12px; background: rgba(255, 127, 80, 0.1); border-left: 4px solid var(--orange); border-radius: 8px;">
                            <div style="display: flex; align-items: center; margin-bottom: 5px;">
                                <span style="background: var(--orange); color: white; padding: 4px 8px; border-radius: 50%; margin-right: 10px; font-size: 12px;">📥</span>
                                <strong>Entrada registrada</strong>
                            </div>
                            <div class="small">Hoy, 08:15 AM</div>
                        </div>
                        
                        <div style="margin-bottom: 15px; padding: 12px; background: rgba(52, 152, 219, 0.1); border-left: 4px solid var(--blue); border-radius: 8px;">
                            <div style="display: flex; align-items: center; margin-bottom: 5px;">
                                <span style="background: var(--blue); color: white; padding: 4px 8px; border-radius: 50%; margin-right: 10px; font-size: 12px;">📤</span>
                                <strong>Salida registrada</strong>
                            </div>
                            <div class="small">Ayer, 17:30 PM</div>
                        </div>
                        
                        <div style="margin-bottom: 15px; padding: 12px; background: rgba(255, 127, 80, 0.1); border-left: 4px solid var(--orange); border-radius: 8px;">
                            <div style="display: flex; align-items: center; margin-bottom: 5px;">
                                <span style="background: var(--orange); color: white; padding: 4px 8px; border-radius: 50%; margin-right: 10px; font-size: 12px;">📥</span>
                                <strong>Entrada registrada</strong>
                            </div>
                            <div class="small">Ayer, 08:20 AM</div>
                        </div>
                        
                        <div style="margin-bottom: 15px; padding: 12px; background: rgba(52, 152, 219, 0.1); border-left: 4px solid var(--blue); border-radius: 8px;">
                            <div style="display: flex; align-items: center; margin-bottom: 5px;">
                                <span style="background: var(--blue); color: white; padding: 4px 8px; border-radius: 50%; margin-right: 10px; font-size: 12px;">📤</span>
                                <strong>Salida registrada</strong>
                            </div>
                            <div class="small">Lunes, 18:05 PM</div>
                        </div>
                        
                        <div style="margin-bottom: 15px; padding: 12px; background: rgba(255, 127, 80, 0.1); border-left: 4px solid var(--orange); border-radius: 8px;">
                            <div style="display: flex; align-items: center; margin-bottom: 5px;">
                                <span style="background: var(--orange); color: white; padding: 4px 8px; border-radius: 50%; margin-right: 10px; font-size: 12px;">📥</span>
                                <strong>Entrada registrada</strong>
                            </div>
                            <div class="small">Lunes, 08:10 AM</div>
                        </div>
                    </div>
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

// Función para editar perfil
function editProfile() {
  alert('✏️ Función de edición de perfil en desarrollo');
}