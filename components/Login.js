import { authenticateUser, db, registerUser } from '../js/db.js';

export function render() {
    return `
        <div class="uniguajira-header">
            <div class="uniguajira-logo">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <rect width="40" height="40" rx="8" fill="white"/>
                    <path d="M8 12h24v16H8z" fill="#4CAF50"/>
                    <text x="20" y="22" text-anchor="middle" fill="white" font-size="10" font-weight="bold">UG</text>
                </svg>
                <span class="logo-text">Mi ingreso</span>
            </div>
            <div class="uniguajira-nav desktop-nav">
                <a href="#" class="nav-item">Inicio</a>
                <a href="#" class="nav-item">Nosotros</a>
                <a href="#" class="nav-item">Interes</a>
                <a href="#" class="nav-item">Universiadad</a>
                <div class="nav-user">👤</div>
            </div>
            <div class="mobile-hamburger" id="mobile-hamburger">
                <div class="hamburger-line"></div>
                <div class="hamburger-line"></div>
                <div class="hamburger-line"></div>
            </div>
            <div class="mobile-nav-menu" id="mobile-nav-menu">
                <a href="#" class="mobile-nav-item">Inicio</a>
                <a href="#" class="mobile-nav-item">Nosotros</a>
                <a href="#" class="mobile-nav-item">Interes</a>
                <a href="#" class="mobile-nav-item">Universiadad</a>
                <div class="mobile-nav-user">👤 Usuario</div>
            </div>
        </div>
        
        <div class="uniguajira-login-container">
            <div class="uniguajira-main">
                <div class="uniguajira-content">
                    <div class="uniguajira-login-form">
                        <div class="login-logo">
                            <img src="./img/logo uniguajira.png" alt="Logo Universidad de La Guajira" class="logo-image">
                        </div>
                        <h2>Mi ingreso</h2>
                        <div class="login-subtitle">Ingresa a tu cuenta</div>
                        <form id="login-form">
                            <div class="form-group">
                                <select id="user-type" name="userType" class="user-type-select" required>
                                    <option value="">Selecciona tipo de usuario</option>
                                    <option value="estudiante">Estudiante</option>
                                    <option value="administrador">Administrador</option>
                                    <option value="visitante">Visitante</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <input type="email" id="email" name="email" placeholder="Correo electrónico" required>
                            </div>
                            <div class="form-group">
                                <input type="password" id="password" name="password" placeholder="Contraseña" required>
                                <span class="password-toggle">👁</span>
                            </div>
                            <button type="submit" class="login-btn">Ingresar</button>
                        </form>
                        <p class="register-link">¿No tienes cuenta? <a href="#/registro">Regístrate aquí</a></p>
                        
                        <!-- Botón temporal para resetear base de datos -->
                        <div class="dev-tools" style="margin-top: 20px; padding: 15px; background: rgba(255, 255, 255, 0.1); border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.2);">
                            <p style="font-size: 12px; color: #fff; margin-bottom: 10px;">🔧 Herramientas de desarrollo:</p>
                            <button id="reset-db-btn" class="reset-db-btn" style="background: #ff6b6b; color: white; border: none; padding: 8px 15px; border-radius: 5px; font-size: 12px; cursor: pointer;">
                                Resetear Base de Datos
                            </button>
                            <div style="font-size: 11px; color: #ccc; margin-top: 8px;">
                                <strong>Usuarios de prueba:</strong><br>
                                📚 Estudiante: estudiante@uni.com / 123456<br>
                                👥 Visitante: visitante@uni.com / 123456<br>
                                🔐 Admin: admin@uni.com / admin123
                            </div>
                        </div>
                    </div>
                    
                    <div class="uniguajira-right-content">
                        <div class="uniguajira-title">
                            <h1>Universidad de La Guajira</h1>
                        </div>
                        
                        <div class="uniguajira-images">
                            <div class="image-card pointsbiot">
                                <div class="image-content">
                                    <img src="./img/IMG_20230503_162416.jpg" alt="Universidad de La Guajira" class="card-image">
                                </div>
                                <span class="image-label">📍 Lugares</span>
                            </div>
                            <div class="image-card interest">
                                <div class="image-content">
                                    <img src="./img/Image_fx (58).jpg" alt="Universidad de La Guajira Campus" class="card-image">
                                </div>
                                <span class="image-label">🎯 Interes</span>
                            </div>
                        </div>
                        
                        <div class="contact-info">
                            <h3>Información de Contacto</h3>
                            <div class="contact-item">
                                <span class="contact-icon">📍</span>
                                <span class="contact-text">Km 5 Vía Maicao, Riohacha - La Guajira</span>
                            </div>
                            <div class="contact-item">
                                <span class="contact-icon">📞</span>
                                <span class="contact-text">+57 (5) 728 7500</span>
                            </div>
                            <div class="contact-item">
                                <span class="contact-icon">✉️</span>
                                <span class="contact-text">info@uniguajira.edu.co</span>
                            </div>
                            <div class="contact-item">
                                <span class="contact-icon">🌐</span>
                                <span class="contact-text">www.uniguajira.edu.co</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

export function mount({ navigate, showToast: showModal }) {
  const form = document.getElementById('login-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userType = document.getElementById('user-type').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    console.log('Intento de login:', { userType, email, password: '***' });
    
    if (!userType) {
      showModal('Por favor selecciona un tipo de usuario', 'error');
      return;
    }
    
    try {
      // Verificar qué usuarios hay en la base de datos
      const allUsers = await db.users.toArray();
      console.log('Usuarios disponibles en la base de datos:', allUsers);
      
      const user = await authenticateUser(email, password);
      console.log('Usuario autenticado:', user);
      
      // Verificar que el rol del usuario coincida con el tipo seleccionado
      const roleMapping = {
        'estudiante': 'estudiante',
        'administrador': 'admin',
        'visitante': 'visitante'
      };
      
      console.log('Mapeo de roles:', { userType, expectedRole: roleMapping[userType], actualRole: user.role });
      
      if (user.role !== roleMapping[userType]) {
        showModal('El tipo de usuario no coincide con tu cuenta', 'error');
        return;
      }
      
      localStorage.setItem('currentUser', JSON.stringify(user));
      showModal('¡Bienvenido!', 'success');
      
      // Redirigir según el tipo de usuario
      switch (userType) {
        case 'estudiante':
          navigate('estudiantes');
          break;
        case 'administrador':
          navigate('admin');
          break;
        case 'visitante':
          navigate('visitantes');
          break;
      }
    } catch (error) {
      console.error('Error en login:', error);
      showModal(error.message, 'error');
    }
  });

  // Event listener para el botón de reseteo de base de datos
  const resetDbBtn = document.getElementById('reset-db-btn');
  if (resetDbBtn) {
    resetDbBtn.addEventListener('click', async () => {
      try {
        resetDbBtn.textContent = 'Reseteando...';
        resetDbBtn.disabled = true;
        
        // Limpiar la base de datos
        await db.users.clear();
        await db.reservas.clear();
        await db.announcements.clear();
        
        // Recrear usuarios de prueba
        await registerUser({
          name: 'Admin',
          email: 'admin@uni.com',
          password: 'admin123',
          role: 'admin',
          adminCode: 'ADMIN2025',
        });
        
        await registerUser({
          name: 'María García Rodríguez',
          email: 'estudiante@uni.com',
          password: '123456',
          role: 'estudiante',
        });
        
        await registerUser({
          name: 'Carlos López Martínez',
          email: 'visitante@uni.com',
          password: '123456',
          role: 'visitante',
        });
        
        // Recrear anuncios
        await db.announcements.bulkAdd([
          {
            title: 'Inicio de semestre',
            body: 'El semestre académico inicia el próximo lunes. Consulta tu horario.',
            createdAt: new Date(),
          },
          {
            title: 'Actualización de biblioteca',
            body: 'Nueva sala de estudio y préstamo de portátiles disponible.',
            createdAt: new Date(),
          },
          {
            title: 'Semana de bienestar',
            body: 'Jornadas deportivas y de salud durante toda la semana.',
            createdAt: new Date(),
          },
          {
            title: 'Inscripciones abiertas',
            body: 'Las inscripciones para el próximo semestre están disponibles hasta el 15 de diciembre.',
            createdAt: new Date(),
          },
          {
            title: 'Conferencia de Ingeniería',
            body: 'Gran conferencia sobre nuevas tecnologías en ingeniería. Auditorio principal, 2:00 PM.',
            createdAt: new Date(),
          },
        ]);
        
        // Verificar que los usuarios se crearon correctamente
        const allUsers = await db.users.toArray();
        console.log('Usuarios en la base de datos:', allUsers);
        
        showModal(`Base de datos reseteada. ${allUsers.length} usuarios creados`, 'success');
        resetDbBtn.textContent = 'Resetear Base de Datos';
        resetDbBtn.disabled = false;
      } catch (error) {
        showModal('Error al resetear la base de datos: ' + error.message, 'error');
        resetDbBtn.textContent = 'Resetear Base de Datos';
        resetDbBtn.disabled = false;
      }
    });
  }

  // Toggle password visibility
  const passwordToggle = document.querySelector('.password-toggle');
  const passwordInput = document.getElementById('password');
  
  passwordToggle.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    passwordToggle.textContent = type === 'password' ? '👁' : '🙈';
  });

  // Funcionalidad del menú hamburguesa
  const hamburger = document.getElementById('mobile-hamburger');
  const mobileNav = document.getElementById('mobile-nav-menu');
  
  if (hamburger && mobileNav) {
    // Toggle del menú hamburguesa
    hamburger.addEventListener('click', function(e) {
      e.stopPropagation();
      hamburger.classList.toggle('active');
      mobileNav.classList.toggle('active');
    });
    
    // Cerrar menú al hacer clic en un enlace
    const mobileNavItems = mobileNav.querySelectorAll('.mobile-nav-item');
    mobileNavItems.forEach(item => {
      item.addEventListener('click', function() {
        hamburger.classList.remove('active');
        mobileNav.classList.remove('active');
      });
    });
    
    // Cerrar menú al hacer clic fuera de él
    document.addEventListener('click', function(e) {
      if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
        hamburger.classList.remove('active');
        mobileNav.classList.remove('active');
      }
    });
    
    // Cerrar menú al cambiar el tamaño de la ventana (si se vuelve a desktop)
    window.addEventListener('resize', function() {
      if (window.innerWidth > 768) {
        hamburger.classList.remove('active');
        mobileNav.classList.remove('active');
      }
    });
  }
}