import { authenticateUser, registerUser, listUsers } from '../js/db.js';

export function render() {
    return `
        <div class="uniguajira-header">
            <div class="uniguajira-logo">
                <img src="./img/mi_ingreso.jpg" alt="Mi ingreso" class="logo-image" />
                <span class="logo-text">Mi ingreso</span>
            </div>
            <div class="uniguajira-nav desktop-nav">
                <a href="#" class="login-nav-item">Inicio</a>
                <a href="#" class="login-nav-item">Nosotros</a>
                <a href="#" class="login-nav-item">Interes</a>
                <a href="https://uniguajira.edu.co" class="login-nav-item">Universidad</a>
                <div class="theme-switch">
                    <input type="checkbox" id="theme-toggle">
                    <label for="theme-toggle">
                        <span class="switch"></span>
                        <span class="theme-text">🌙</span>
                    </label>
                </div>
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
                <div class="theme-switch">
                    <input type="checkbox" id="theme-toggle-mobile">
                    <label for="theme-toggle-mobile">
                        <span class="switch"></span>
                        <span class="theme-text">🌙</span>
                    </label>
                </div>
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
      // Verificar qué usuarios hay en la base de datos (SQLite)
      const allUsers = await listUsers();
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

  // Herramientas de desarrollo eliminadas: se removió el botón de reset de BD

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

  // Funcionalidad del interruptor de tema (escritorio y móvil)
  const themeToggles = Array.from(document.querySelectorAll('#theme-toggle, #theme-toggle-mobile'));
  const themeTexts = Array.from(document.querySelectorAll('.theme-text'));

  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  themeToggles.forEach(t => t && (t.checked = savedTheme === 'dark'));
  themeTexts.forEach(el => el && (el.textContent = savedTheme === 'dark' ? '☀️' : '🌙'));

  themeToggles.forEach(toggle => {
    if (!toggle) return;
    toggle.addEventListener('change', function() {
      const isDark = this.checked;
      const newTheme = isDark ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      themeTexts.forEach(el => el && (el.textContent = isDark ? '☀️' : '🌙'));
      // Sincronizar el otro toggle
      themeToggles.forEach(other => {
        if (other && other !== this) other.checked = isDark;
      });
    });
  });
}