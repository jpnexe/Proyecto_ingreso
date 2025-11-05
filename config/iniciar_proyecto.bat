@echo off
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