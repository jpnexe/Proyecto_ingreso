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
- **BarcodeDetector API**: Escaneo de códigos QR (Chrome/Edge)
- **Chart.js**: Visualización de gráficos interactivos

### Base de Datos
 - **SQLite en navegador (sql.js)**: Persistencia local con archivo SQLite guardado en IndexedDB
 - **IndexedDB**: Capa de almacenamiento en el navegador
 - **Dexie.js (compatibilidad)**: Mantener algunas funciones heredadas; SQLite está activo por defecto

### Herramientas
 - **Vite**: Servidor de desarrollo y bundler moderno
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
│   ├── db.js              # Gestión de base de datos (SQLite con sql.js)
│   ├── alt_db.js          # Base de datos alternativa (compatibilidad)
│   └── charts.js          # Visualización de gráficos interactivos
├── css/                  # Estilos CSS
│   ├── admin-dashboard.css # Estilos del panel de administración
│   ├── schedule-styles.css # Estilos del calendario/horarios
│   └── styles.css         # Hoja de estilos principal
├── img/                  # Recursos de imágenes
│   ├── logo uniguajira.png
│   ├── IMG_20230503_162416.jpg
│   └── Image_fx (58).jpg
├── data/                 # Persistencia local (SQLite)
│   └── dashboard.sqlite   # Base de datos principal
├── config/               # Scripts utilitarios
│   ├── iniciar_proyecto.bat  # Script para iniciar (Windows)
│   ├── iniciar_proyecto.py   # Script para iniciar (Python)
│   ├── git_upload.py         # Script para subir a Git
│   ├── git_update.py         # Script para actualizar desde Git
│   ├── iniciar_ngrok.py      # Script para tunelización ngrok
│   └── INSTRUCCIONES_GIT_SCRIPT.md # Documentación de scripts
├── index.html            # Página principal
├── vite.config.js        # Configuración de Vite
├── package.json          # Scripts y dependencias
├── responsive_test.html  # Pruebas de diseño responsivo
└── README.md            # Documentación del proyecto
```

## 🚀 Instalación y Configuración

### Prerrequisitos
 - Navegador web moderno (Chrome, Edge recomendado para QR)
 - Node.js v18+ y npm

### Pasos de Instalación

1. **Clonar o descargar el proyecto**
  ```bash
  git clone [URL_DEL_REPOSITORIO]
  cd Uni_proyec_dev
  ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Ejecutar en desarrollo (Vite)**
   ```bash
   npm run dev
   # Abre: http://localhost:5173/
   ```
   - Alternativas: `config\\iniciar_proyecto.bat` o `python config/iniciar_proyecto.py`

4. **Build y preview (opcional)**
   ```bash
   npm run build
   npm run preview
   # Abre: http://localhost:5173/
   ```

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
- **Registrar ingreso (QR/Código)**: Modal para escaneo QR o ingreso manual `UG-<id>`
- **Columna "Código"** en la tabla de estudiantes: visualiza `UG-<id>` por alumno
- **Gráficos interactivos**:
  - Registros diarios por rol
  - Distribución de estudiantes por carrera
  - Gráficos mini de resumen
- **Sidebar navegable** con múltiples secciones: Buscar, Inicio, Reportes, Estadísticas, Mensajes, Calendario, Usuarios, Ajustes
- **Notificaciones en tiempo real** con historial
- **Modo oscuro/claro** para el panel
- **Exportación/Importación de datos** desde la base de datos

### 🎓 Portal de Estudiantes
- **Visualización de anuncios** académicos
- **Información personal** del estudiante
- **Interfaz personalizada** para estudiantes
 - **Credencial de Ingreso (QR)**: muestra el código visible `UG-<id>` y su QR
 - **Historial de ingresos**: lista entradas desde la tabla `entries` y muestra el último registro

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
  career: String,       // Carrera (solo estudiante)
  semester: String,     // Semestre (solo estudiante)
  status: String,       // Estado ('activo'|'inactivo')
  visitReason: String,  // Motivo (solo visitante)
  user_code: String,    // Código visible único (formato UG-<id>)
  createdAt: Date,      // Fecha de creación
  lastLogin: Date       // Último acceso
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
#### Tabla: `entries` (Registros de ingreso)
```javascript
{
  id: Number,           // ID único autoincrementable
  user_id: Number,      // ID del usuario
  method: String,       // 'qr' | 'manual'
  created_at: Number    // Timestamp (ms desde epoch)
}
```

### Funciones de Base de Datos

- `registerUser()`: Registro de nuevos usuarios
- `authenticateUser()`: Autenticación de usuarios
- `listUsers()`: Listar todos los usuarios
- `updateUser()`: Actualizar información de usuario
- `getUserStats()`: Obtener estadísticas de usuarios
- `createReserva()`: Crear nueva reserva
- `listReservas()`: Listar reservas por usuario
- `listAnnouncements()`: Obtener anuncios
- `getUserByCode(code)`: Buscar usuario por código visible `UG-<id>`
- `registerEntry(userId, method)`: Registrar ingreso (`qr` o `manual`)
- `listEntriesByUser(userId, limit)`: Listar ingresos por usuario
- `getLastEntryForUser(userId)`: Obtener el último registro de ingreso
- `getDailyEntryStats()`: Estadísticas de ingresos diarios por rol
- `exportSQLite()` / `importSQLite(blob)`: Exportar/Importar la base de datos
- `logAction()`: Registrar acciones de administración
- `getLogs()`: Obtener historial de acciones
- **Funciones alternativas** (en `alt_db.js` para compatibilidad):
  - `altListTasks()`, `altCreateTask()`, `altUpdateTask()`, `altDeleteTask()`
  - `altReplaceAllTasks()`, `altExportSQLite()`, `altImportSQLite()`

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

### 4. Registrar Ingreso (Administración)
1. En el panel de **Inicio**, haz clic en el KPI "Registrar ingreso".
2. En el modal, elige:
   - **Escanear QR**: apunta la cámara al QR del estudiante.
   - **Ingresar código**: escribe el correo o el código `UG-<id>`.
3. Al registrar, se crea una entrada en `entries` con fecha/hora y método.

Notas:
- El escaneo usa `BarcodeDetector` (disponible en Chrome/Edge). Si no está soportado, usa el modo código.
- Se requiere permiso de cámara para el escaneo.

## 🔧 Desarrollo

### Arquitectura
- **Patrón SPA**: Single Page Application con router personalizado
- **Componentes modulares**: Cada vista es un componente independiente
- **Gestión de estado**: Estado global para usuario actual
- **Event-driven**: Comunicación entre componentes via eventos
- **Dev server**: Vite (scripts en `package.json`)
- **Persistencia**: SQLite (sql.js) almacenada en IndexedDB (`data/dashboard.sqlite`)
- **Visualización**: Chart.js para gráficos interactivos

### Scripts de Configuración (en `config/`)
- **`iniciar_proyecto.bat` / `iniciar_proyecto.py`**: Inicia el servidor de desarrollo Vite
- **`git_update.py`**: Automatiza `git pull` con guardado de cambios locales
- **`git_upload.py`**: Facilita `git push` con mensajes de commit
- **`iniciar_ngrok.py`**: Configura túneles ngrok para acceso remoto

### Flujo de la Aplicación
1. **Carga inicial**: `app.js` inicializa el router y la base de datos
2. **Routing**: Sistema de rutas hash-based (`#/login`, `#/registro`, etc.)
3. **Renderizado**: Componentes se renderizan dinámicamente
4. **Interactividad**: Event listeners se configuran en `mount()`
5. **Gráficos**: Chart.js genera visualizaciones en el panel de administración

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
- **Gráficos interactivos**: Chart.js con gradientes y animaciones
- **Base de datos dual**: Soporte para sql.js (primaria) y Dexie.js (alternativa)

## 🚀 Próximas Mejoras

- [ ] Sistema de notificaciones push
- [ ] Integración con API externa
- [ ] Modo oscuro/claro (en desarrollo en AdminDashboard)
- [ ] Exportación de datos a PDF/Excel
- [ ] Sistema de roles más granular
- [ ] Integración con calendario avanzado
- [ ] Chat en tiempo real
- [ ] Módulo de calificaciones
- [ ] Sistema de tareas con prioridades
- [ ] Análisis y reportes avanzados

## 📞 Soporte

Para soporte técnico o consultas sobre el sistema:
- **Universidad de La Guajira**
- **Teléfono**: +57 (5) 728 7500
- **Email**: soporte@uniguajira.edu.co

---

**Desarrollado con 🤡 para la Universidad de La Guajira**

---

## 📝 Historial de Cambios Recientes

### Versión Actual
**Última actualización**: Noviembre 2025

#### ✨ Cambios funcionales
- Importación masiva (CSV) ahora admite `user_code` opcional y genera códigos visibles: `UG-<id>` para estudiantes, `UV-<id>` para visitantes.
- Se agregaron archivos de prueba para importación:
  - `pruebas/estudiantes_bulk_150.csv` con contraseña `123456` para todos
  - `pruebas/visitantes_bulk_100.csv` con contraseña `123456`
- Gestión de usuarios con selección múltiple:
  - Checkbox por fila y “Marcar todo” en encabezado y barra de acciones
  - Botón “Eliminar seleccionados” que borra en cascada los usuarios elegidos (reservas, ingresos, sesiones y logs)
- Registro por QR sin duplicados:
  - Bloqueo de escaneo y detención inmediata del detector tras la primera lectura para evitar múltiples registros por frame
  - Los logs de registro de entrada/salida quedan centralizados en las funciones de BD
- Semillas de datos demo para estadísticas:
  - Se insertan ~60 usuarios (36 estudiantes + 24 visitantes) con nombres aleatorios y contraseña `123456`
  - Se generan ingresos/salidas de los últimos 14 días para activar las gráficas
- Navbar corregido: ocultar enlaces públicos cuando hay sesión activa para evitar texto duplicado al redirigir al login

#### 🧩 UI/UX
- Modal de detalles de estudiantes recentrado en pantalla.
- Sidebar de administración en modo claro optimizado en pantallas estrechas: mayor contraste y legibilidad.
- Menús desplegables (select) estilizados con glass morphism, flecha SVG y estados hover/focus acordes al tema.

#### 🗑️ Decisiones y remociones
- Se retiró el historial persistente de cargues masivos en Ajustes. Ahora se muestra únicamente el resultado de la importación en la propia sección. Las funciones internas de auditoría pueden mantenerse para uso futuro.

#### 🔧 Referencias técnicas
- Registro de ingreso: `c:\Users\jaide\Desktop\Uni_proyec_dev\js\db.js:879-885`
- Registro de salida: `c:\Users\jaide\Desktop\Uni_proyec_dev\js\db.js:971-975`
- Escaneo QR y bloqueo de duplicados:
  - Ingreso: `c:\Users\jaide\Desktop\Uni_proyec_dev\components\AdminDashboard.js:1104-1113`
  - Salida: `c:\Users\jaide\Desktop\Uni_proyec_dev\components\AdminDashboard.js:1180-1189`
- Selección múltiple y eliminación en usuarios: `c:\Users\jaide\Desktop\Uni_proyec_dev\components\AdminDashboard.js:1829-2006`
- Borrado en cascada: `c:\Users\jaide\Desktop\Uni_proyec_dev\js\db.js:1121-1133`
- Semillas de datos demo: `c:\Users\jaide\Desktop\Uni_proyec_dev\js\db.js:383-438`
- Navbar ocultando enlaces públicos: `c:\Users\jaide\Desktop\Uni_proyec_dev\components\Navbar.js:36-43,58-64`
- Sidebar claro mejorado: `c:\Users\jaide\Desktop\Uni_proyec_dev\css\admin-dashboard.css:1000-1023`
- Selects estilizados: `c:\Users\jaide\Desktop\Uni_proyec_dev\css\admin-dashboard.css:610-667,668-691`

#### ✅ Cómo probar rápidamente
- Ejecuta el servidor: `npm run dev` y abre `http://localhost:5173/`.
- En Ajustes → Importación CSV, usa las plantillas de `pruebas/` para cargar datos.
- En Gestión de usuarios, marca varias filas y prueba “Eliminar seleccionados”.
- En Inicio, registra ingreso/salida con QR; debe crear un único registro por lectura.
- Revisa las gráficas; deberían mostrar actividad por las semillas de datos demo.