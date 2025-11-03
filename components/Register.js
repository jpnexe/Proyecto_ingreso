import { registerUser } from '../js/db.js';

export function render() {
    return `
        <div class="uniguajira-header">
            <div class="uniguajira-logo">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <rect width="40" height="40" rx="8" fill="white"/>
                    <path d="M8 12h24v16H8z" fill="#4CAF50"/>
                    <text x="20" y="22" text-anchor="middle" fill="white" font-size="10" font-weight="bold">UG</text>
                </svg>
                <span class="logo-text">Registro</span>
            </div>
            <div class="uniguajira-nav desktop-nav">
                <a href="#" class="nav-item">Inicio</a>
                <a href="#" class="nav-item">Nosotros</a>
                <a href="#" class="nav-item">Interes</a>
                <a href="#" class="nav-item">Universidad</a>
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
                <a href="#" class="mobile-nav-item">Universidad</a>
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
                        <h2>Registro de Usuario</h2>
                        <div class="login-subtitle">Crea tu cuenta en la Universidad</div>
                        <form id="register-form">
                            <div class="form-group">
                                <input type="text" id="name" name="name" placeholder="Nombre completo" required>
                            </div>
                            <div class="form-group">
                                <input type="email" id="email" name="email" placeholder="Correo electrónico" required>
                            </div>
                            <div class="form-group">
                                <input type="password" id="password" name="password" placeholder="Contraseña" required>
                                <span class="password-toggle" id="password-toggle">👁</span>
                            </div>
                            <div class="form-group">
                                <input type="password" id="confirm-password" name="confirmPassword" placeholder="Confirmar contraseña" required>
                                <span class="password-toggle" id="confirm-password-toggle">👁</span>
                            </div>
                            <div class="form-group">
                                <select id="user-type" name="userType" class="user-type-select" required>
                                    <option value="">Selecciona tipo de usuario</option>
                                    <option value="estudiante">Estudiante</option>
                                    <option value="admin">Administrador</option>
                                    <option value="visitante">Visitante</option>
                                </select>
                            </div>
                            <div class="form-group hidden" id="admin-code-wrap">
                                <input type="text" id="adminCode" name="adminCode" placeholder="Código de administrador (ADMIN2025)">
                                <div class="help-text">Requerido solo para crear usuarios con rol administrador.</div>
                            </div>
                            <button type="submit" class="login-btn">Registrarme</button>
                        </form>
                        <p class="register-link">¿Ya tienes cuenta? <a href="#/login">Inicia sesión aquí</a></p>
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
                                <span class="image-label">🎓 Estudiantes</span>
                            </div>
                            <div class="image-card interest">
                                <div class="image-content">
                                    <img src="./img/Image_fx (58).jpg" alt="Universidad de La Guajira Campus" class="card-image">
                                </div>
                                <span class="image-label">👥 Comunidad</span>
                            </div>
                        </div>
                        
                        <div class="contact-info">
                            <h3>Tipos de Usuario</h3>
                            <div class="contact-item">
                                <span class="contact-icon">🎓</span>
                                <span class="contact-text">Estudiantes: Acceso a servicios académicos</span>
                            </div>
                            <div class="contact-item">
                                <span class="contact-icon">👨‍💼</span>
                                <span class="contact-text">Administradores: Gestión del sistema</span>
                            </div>
                            <div class="contact-item">
                                <span class="contact-icon">👥</span>
                                <span class="contact-text">Visitantes: Acceso a información general</span>
                            </div>
                            <div class="contact-item">
                                <span class="contact-icon">📞</span>
                                <span class="contact-text">Soporte: +57 (5) 728 7500</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

export function mount({ navigate, showToast }) {
    const form = document.getElementById('register-form');
    const adminWrap = document.getElementById('admin-code-wrap');
    const userTypeSelect = document.getElementById('user-type');
    
    // Mostrar/ocultar campo de código de administrador
    userTypeSelect.addEventListener('change', () => {
        const isAdmin = userTypeSelect.value === 'admin';
        adminWrap.classList.toggle('hidden', !isAdmin);
    });
    
    // Toggle password visibility para contraseña
    const passwordToggle = document.getElementById('password-toggle');
    const passwordInput = document.getElementById('password');
    
    passwordToggle.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        passwordToggle.textContent = type === 'password' ? '👁' : '🙈';
    });
    
    // Toggle password visibility para confirmar contraseña
    const confirmPasswordToggle = document.getElementById('confirm-password-toggle');
    const confirmPasswordInput = document.getElementById('confirm-password');
    
    confirmPasswordToggle.addEventListener('click', () => {
        const type = confirmPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        confirmPasswordInput.setAttribute('type', type);
        confirmPasswordToggle.textContent = type === 'password' ? '👁' : '🙈';
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
    
    // Manejo del formulario de registro
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Obtener valores del formulario
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const userType = document.getElementById('user-type').value;
        const adminCode = document.getElementById('adminCode').value.trim();
        
        // Validaciones básicas
        if (!name) {
            showToast('Por favor ingresa tu nombre completo', 'error');
            return;
        }
        
        if (!email) {
            showToast('Por favor ingresa tu correo electrónico', 'error');
            return;
        }
        
        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showToast('Por favor ingresa un correo electrónico válido', 'error');
            return;
        }
        
        if (!password) {
            showToast('Por favor ingresa una contraseña', 'error');
            return;
        }
        
        if (!confirmPassword) {
            showToast('Por favor confirma tu contraseña', 'error');
            return;
        }
        
        if (!userType) {
            showToast('Por favor selecciona un tipo de usuario', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            showToast('Las contraseñas no coinciden', 'error');
            return;
        }
        
        if (password.length < 6) {
            showToast('La contraseña debe tener al menos 6 caracteres', 'error');
            return;
        }
        
        // Validación específica para administradores
        if (userType === 'admin') {
            if (!adminCode) {
                showToast('El código de administrador es requerido', 'error');
                return;
            }
            if (adminCode !== 'ADMIN2025') {
                showToast('Código de administrador inválido. Usa: ADMIN2025', 'error');
                return;
            }
        }
        
        // Deshabilitar el botón de envío para evitar múltiples envíos
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Registrando...';
        
        try {
            console.log('Intentando registrar usuario:', { name, email, role: userType, adminCode });
            
            await registerUser({ 
                name, 
                email, 
                password, 
                role: userType, 
                adminCode 
            });
            
            showToast('Usuario registrado correctamente', 'success');
            
            // Limpiar formulario
            form.reset();
            adminWrap.classList.add('hidden');
            
            // Redirigir al login después de un breve delay
            setTimeout(() => {
                navigate('/login');
            }, 1500);
            
        } catch (err) {
            console.error('Error al registrar usuario:', err);
            showToast(err.message || 'Error al registrar usuario', 'error');
        } finally {
            // Rehabilitar el botón
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}