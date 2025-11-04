@echo off
echo ========================================
echo ACTUALIZAR PROYECTO DESDE GIT
echo ========================================
echo.

REM Verificar si Python está instalado
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python no está instalado o no está en el PATH
    echo Por favor, instala Python e intenta nuevamente
    pause
    exit /b 1
)

REM Verificar si el script existe
if not exist "git_update.py" (
    echo ❌ No se encontró el archivo git_update.py
    echo Asegúrate de que esté en el mismo directorio que este archivo .bat
    pause
    exit /b 1
)

echo ✅ Python detectado correctamente
echo ✅ Script git_update.py encontrado
echo.
echo 🔄 Ejecutando actualización desde Git...
echo.

REM Ejecutar el script de Python
python git_update.py

REM Capturar el código de salida
set exit_code=%errorlevel%

echo.
if %exit_code% equ 0 (
    echo ✅ Actualización completada exitosamente
) else (
    echo ❌ La actualización tuvo problemas
)

echo.
echo Presiona cualquier tecla para salir...
pause >nul