@echo off
chcp 65001 >nul
title Subir Proyecto a Git

echo.
echo ==========================================
echo    SCRIPT AUTOMATICO PARA SUBIR A GIT
echo ==========================================
echo.

REM Verificar si Python está instalado
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python no está instalado o no está en el PATH
    echo 💡 Instala Python desde: https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Ejecutar el script de Python
python git_upload.py

REM Mantener la ventana abierta si hay error
if %errorlevel% neq 0 (
    echo.
    echo ❌ El script terminó con errores
    pause
)

exit /b %errorlevel%