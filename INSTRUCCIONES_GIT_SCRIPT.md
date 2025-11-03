# 🚀 Script Automático para Subir a Git

Este script automatiza completamente el proceso de subir cambios a GitHub. Solo necesitas proporcionar el mensaje del commit y el script hace todo lo demás.

## 📋 ¿Qué hace el script?

El script realiza automáticamente estos pasos:
1. ✅ Verifica que Git esté instalado
2. 🔍 Verifica que hay cambios para subir
3. 📁 Ejecuta `git add -A` (agrega todos los archivos)
4. 💾 Ejecuta `git commit -m "tu mensaje"`
5. 🚀 Ejecuta `git push` (sube a GitHub)

## 🎯 Cómo usar el script

### Opción 1: Archivo .bat (Más fácil)
1. Haz doble clic en `subir_a_git.bat`
2. Escribe tu mensaje de commit cuando te lo pida
3. ¡Listo! El script hace todo automáticamente

### Opción 2: Ejecutar Python directamente
1. Abre la terminal en la carpeta del proyecto
2. Ejecuta: `python git_upload.py`
3. Escribe tu mensaje de commit cuando te lo pida

## 📝 Ejemplos de mensajes de commit

Buenos ejemplos:
- `"Agregué nueva funcionalidad de login"`
- `"Corregí error en el dashboard de estudiantes"`
- `"Actualicé estilos CSS del navbar"`
- `"Primera versión del proyecto"`

## ⚠️ Requisitos

- **Python 3.x** instalado
- **Git** configurado con tus credenciales
- Estar en un repositorio Git válido

## 🔧 Características del script

- 🛡️ **Seguro**: Verifica todo antes de ejecutar
- 📊 **Informativo**: Muestra el progreso paso a paso
- ❌ **Manejo de errores**: Te dice exactamente qué salió mal
- 🎨 **Interfaz amigable**: Usa emojis y colores para mejor experiencia
- ⏰ **Timestamps**: Registra cuándo se realizaron las acciones

## 🚨 Qué hacer si hay errores

### Error: "Git no está instalado"
- Instala Git desde: https://git-scm.com/downloads

### Error: "Python no está instalado"
- Instala Python desde: https://www.python.org/downloads/

### Error: "No estás en un repositorio Git"
- Asegúrate de estar en la carpeta correcta del proyecto

### Error al hacer push
- Verifica tu conexión a internet
- Verifica tus credenciales de Git
- Puede que necesites hacer `git pull` primero

## 💡 Consejos

1. **Siempre revisa los cambios** antes de usar el script
2. **Usa mensajes descriptivos** para tus commits
3. **Haz commits frecuentes** con cambios pequeños
4. **Mantén el script actualizado** si haces cambios

## 🔄 Flujo de trabajo recomendado

1. Haces cambios en tu código
2. Ejecutas `subir_a_git.bat`
3. Escribes un mensaje descriptivo
4. El script sube todo automáticamente
5. ¡Listo para seguir programando!

---

**Creado por:** Asistente IA  
**Fecha:** Noviembre 2024  
**Versión:** 1.0