# 🎓 Sistema de Gestión Universitaria - Universidad de La Guajira

Un sistema web moderno para la gestión de usuarios, reservas y servicios académicos de la Universidad de La Guajira, desarrollado con tecnologías web nativas y diseño glass morphism.

## 📋 Tabla de Contenidos

- [Características](#características)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Instalación y Configuración](#instalación-y-configuración)
- [Funcionalidades](#funcionalidades)
- [Tipos de Usuario](#tipos-de-usuario)
- [Base de Datos](#base-de-datos)
- [Diseño y Estilos](#diseño-y-estilos)
- [Uso del Sistema](#uso-del-sistema)
- [Desarrollo](#desarrollo)

## ✨ Características

- 🎨 **Diseño Moderno**: Interfaz con glass morphism y efectos visuales avanzados
- 📱 **Totalmente Responsivo**: Adaptable a dispositivos móviles, tablets y escritorio
- 🔐 **Sistema de Autenticación**: Login y registro seguro con validaciones
- 👥 **Múltiples Roles**: Administradores, estudiantes y visitantes
- 📊 **Panel Administrativo**: Gestión completa de usuarios y estadísticas
- 📅 **Sistema de Reservas**: Para visitantes con gestión de horarios
- 📢 **Sistema de Anuncios**: Para comunicación con estudiantes
- 🌐 **SPA (Single Page Application)**: Navegación fluida sin recargas

## 🛠️ Tecnologías Utilizadas

### Frontend
- **HTML5**: Estructura semántica
- **CSS3**: Estilos avanzados con glass morphism
- **JavaScript ES6+**: Lógica de aplicación moderna
- **CSS Grid & Flexbox**: Layout responsivo

### Base de Datos
- **Dexie.js**: Base de datos IndexedDB para almacenamiento local
- **IndexedDB**: Almacenamiento persistente en el navegador

### Herramientas
- **Live Server**: Servidor de desarrollo local
- **Git**: Control de versiones

## 📁 Estructura del Proyecto

```
Uni_proyec_dev/
├── components/           # Componentes de la aplicación
│   ├── AdminDashboard.js    # Panel de administración
│   ├── Estudiantes.js       # Portal de estudiantes
│   ├── Login.js            # Página de inicio de sesión
│   ├── Register.js         # Página de registro
│   ├── Visitantes.js       # Portal de visitantes
│   ├── Navbar.js           # Barra de navegación
│   └── Weather.js          # Componente del clima
├── js/                   # Lógica de la aplicación
│   ├── app.js             # Aplicación principal y router
│   └── db.js              # Gestión de base de datos
├── styles/               # Estilos CSS
│   └── styles.css         # Hoja de estilos principal
├── img/                  # Recursos de imágenes
│   ├── logo uniguajira.png
│   ├── IMG_20230503_162416.jpg
│   └── Image_fx (58).jpg
├── index.html            # Página principal
└── README.md            # Documentación del proyecto
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Servidor web local (Live Server recomendado)

### Pasos de Instalación

1. **Clonar o descargar el proyecto**
   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd Uni_proyec_dev
   ```

2. **Instalar Live Server (VS Code)**
   - Instalar la extensión "Live Server" en VS Code
   - O usar cualquier servidor web local

3. **Ejecutar el proyecto**
   - Abrir `index.html` con Live Server
   - O servir desde `http://localhost:5501`

4. **Acceder al sistema**
   - Navegar a `http://127.0.0.1:5501/index.html`

## 🎯 Funcionalidades

### 🔐 Sistema de Autenticación
- **Registro de usuarios** con validaciones completas
- **Inicio de sesión** seguro
- **Validación de roles** (estudiante, administrador, visitante)
- **Código especial** para administradores (`ADMIN2025`)

### 👨‍💼 Panel de Administración
- **Estadísticas en tiempo real** de usuarios
- **Gestión de usuarios**: editar, actualizar roles
- **Filtrado y búsqueda** de usuarios
- **KPIs visuales** por tipo de usuario

### 🎓 Portal de Estudiantes
- **Visualización de anuncios** académicos
- **Información personal** del estudiante
- **Interfaz personalizada** para estudiantes

### 👥 Portal de Visitantes
- **Sistema de reservas** con validación de horarios
- **Gestión de citas** por motivo (trámite, consulta, admisión, etc.)
- **Historial de reservas** personales

## 👤 Tipos de Usuario

### 🔧 Administrador
- **Acceso**: Código especial `ADMIN2025`
- **Permisos**: Gestión completa del sistema
- **Funciones**: 
  - Ver estadísticas de usuarios
  - Editar información de usuarios
  - Cambiar roles de usuarios
  - Acceso a panel administrativo

### 🎓 Estudiante
- **Acceso**: Registro libre
- **Permisos**: Consulta de información académica
- **Funciones**:
  - Ver anuncios académicos
  - Consultar información personal
  - Acceso a servicios estudiantiles

### 👥 Visitante
- **Acceso**: Registro libre
- **Permisos**: Servicios básicos y reservas
- **Funciones**:
  - Crear reservas de citas
  - Ver historial de reservas
  - Acceso a información general

## 🗄️ Base de Datos

### Estructura de Datos

#### Tabla: `users`
```javascript
{
  id: Number,           // ID único autoincrementable
  name: String,         // Nombre completo
  email: String,        // Correo electrónico (único)
  password: String,     // Contraseña hasheada
  role: String,         // 'admin' | 'estudiante' | 'visitante'
  createdAt: Date       // Fecha de creación
}
```

#### Tabla: `reservas`
```javascript
{
  id: Number,           // ID único autoincrementable
  userId: Number,       // ID del usuario
  date: Date,           // Fecha y hora de la reserva
  day: String,          // Día de la semana
  motivo: String,       // Motivo de la reserva
  createdAt: Date       // Fecha de creación
}
```

#### Tabla: `announcements`
```javascript
{
  id: Number,           // ID único autoincrementable
  title: String,        // Título del anuncio
  body: String,         // Contenido del anuncio
  createdAt: Date       // Fecha de creación
}
```

### Funciones de Base de Datos

- `registerUser()`: Registro de nuevos usuarios
- `loginUser()`: Autenticación de usuarios
- `listUsers()`: Listar todos los usuarios
- `updateUser()`: Actualizar información de usuario
- `getUserStats()`: Obtener estadísticas de usuarios
- `createReserva()`: Crear nueva reserva
- `listReservas()`: Listar reservas por usuario
- `listAnnouncements()`: Obtener anuncios

## 🎨 Diseño y Estilos

### Glass Morphism
- **Efectos de cristal** con `backdrop-filter: blur()`
- **Transparencias** con `rgba()` y gradientes
- **Sombras suaves** para profundidad
- **Bordes translúcidos** para definición

### Responsive Design
- **Mobile First**: Diseño optimizado para móviles
- **Breakpoints**:
  - `768px`: Tablets
  - `900px`: Pantallas medianas
  - `1200px+`: Escritorio

### Componentes UI
- **Formularios elegantes** con validaciones visuales
- **Botones interactivos** con efectos hover
- **Tarjetas glass** para contenido
- **Navegación hamburguesa** para móviles

## 📖 Uso del Sistema

### 1. Registro de Usuario
1. Navegar a `/registro`
2. Completar formulario con datos personales
3. Seleccionar tipo de usuario
4. Para administradores: ingresar código `ADMIN2025`
5. Confirmar registro

### 2. Inicio de Sesión
1. Navegar a `/login`
2. Ingresar email y contraseña
3. El sistema redirige según el rol del usuario

### 3. Navegación por Roles

#### Como Administrador:
- Acceso automático al panel de administración
- Gestión de usuarios desde la tabla interactiva
- Visualización de estadísticas en tiempo real

#### Como Estudiante:
- Visualización de anuncios académicos
- Consulta de información personal
- Acceso a servicios estudiantiles

#### Como Visitante:
- Creación de reservas seleccionando fecha, hora y motivo
- Visualización del historial de reservas
- Gestión de citas programadas

## 🔧 Desarrollo

### Arquitectura
- **Patrón SPA**: Single Page Application con router personalizado
- **Componentes modulares**: Cada vista es un componente independiente
- **Gestión de estado**: Estado global para usuario actual
- **Event-driven**: Comunicación entre componentes via eventos

### Flujo de la Aplicación
1. **Carga inicial**: `app.js` inicializa el router y la base de datos
2. **Routing**: Sistema de rutas hash-based (`#/login`, `#/registro`, etc.)
3. **Renderizado**: Componentes se renderizan dinámicamente
4. **Interactividad**: Event listeners se configuran en `mount()`

### Validaciones Implementadas
- **Email**: Formato válido requerido
- **Contraseñas**: Mínimo 6 caracteres, confirmación requerida
- **Roles**: Validación de código de administrador
- **Reservas**: Prevención de duplicados en mismo horario
- **Formularios**: Validación en tiempo real

### Características Técnicas
- **Almacenamiento local**: Datos persistentes con IndexedDB
- **Responsive**: CSS Grid y Flexbox para layouts adaptativos
- **Accesibilidad**: Etiquetas semánticas y navegación por teclado
- **Performance**: Carga lazy de componentes y optimización de assets

## 🚀 Próximas Mejoras

- [ ] Sistema de notificaciones push
- [ ] Integración con API externa
- [ ] Modo oscuro/claro
- [ ] Exportación de datos
- [ ] Sistema de roles más granular
- [ ] Integración con calendario
- [ ] Chat en tiempo real
- [ ] Módulo de calificaciones

## 📞 Soporte

Para soporte técnico o consultas sobre el sistema:
- **Universidad de La Guajira**
- **Teléfono**: +57 (5) 728 7500
- **Email**: soporte@uniguajira.edu.co

---

**Desarrollado con 🤡 para la Universidad de La Guajira**