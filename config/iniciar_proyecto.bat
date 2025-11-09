@echo off
setlocal
REM Lanzador del proyecto vía Python (iniciar_proyecto.py)

set SCRIPT_DIR=%~dp0
REM Ir al root del proyecto
cd /d "%SCRIPT_DIR%.."

echo Iniciando proyecto...
REM Intentar con 'py' primero (Windows), luego 'python'
where py >nul 2>&1
if %errorlevel%==0 (
  py "%SCRIPT_DIR%iniciar_proyecto.py"
) else (
  where python >nul 2>&1
  if %errorlevel%==0 (
    python "%SCRIPT_DIR%iniciar_proyecto.py"
  ) else (
    echo No se encontró Python en PATH. Instala Python 3 o agrega 'py'/'python' al PATH.
    echo Puedes ejecutar manualmente: python config\iniciar_proyecto.py
    pause
  )
)

endlocal
setlocal ENABLEDELAYEDEXPANSION
title Mi Ingreso – Inicio rápido

REM Ir al directorio del script
cd /d "%~dp0"

echo ===============================
echo  Mi Ingreso – Inicio rápido
echo ===============================
echo.

REM Verificar Node.js
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo [ERROR] Node.js no está instalado o no está en el PATH.
  echo Descárgalo desde: https://nodejs.org/
  pause
  exit /b 1
)

REM Verificar npm
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo [ERROR] npm no está disponible. Reinstala Node.js.
  pause
  exit /b 1
)

REM Instalar dependencias si faltan
if not exist node_modules (
  echo Instalando dependencias...
  call npm install
  if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Fallo instalando dependencias.
    pause
    exit /b 1
  )
)

echo Iniciando servidor de desarrollo (Vite)...
echo Se abrirá el navegador automáticamente.
echo.
call npm run dev -- --open

REM Mantener la ventana abierta si el proceso termina
pause