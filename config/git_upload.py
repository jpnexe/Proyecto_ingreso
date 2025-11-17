#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para automatizar la subida de cambios a Git
Autor: Asistente IA
Descripción: Este script automatiza el proceso de git add, commit y push
             pidiendo únicamente el mensaje del commit al usuario.
"""

import subprocess
import sys
import os
from datetime import datetime

GIT_USERNAME = os.environ.get("GITHUB_USERNAME") or os.environ.get("GIT_USERNAME") or "jpnexe"
GIT_EMAIL = os.environ.get("GITHUB_EMAIL") or os.environ.get("GIT_EMAIL") or "jaider.sg6003@gmail.com"
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN") or ""
GITHUB_REPO = os.environ.get("GITHUB_REPO") or ""

def ejecutar_comando(comando, mostrar_salida=True):
    """
    Ejecuta un comando en la terminal y retorna el resultado
    """
    try:
        resultado = subprocess.run(
            comando, 
            shell=True, 
            capture_output=True, 
            text=True, 
            encoding='utf-8'
        )
        
        if mostrar_salida and resultado.stdout:
            print(resultado.stdout)
        
        if resultado.stderr and resultado.returncode != 0:
            print(f"❌ Error: {resultado.stderr}")
            return False, resultado.stderr
        
        return True, resultado.stdout
    
    except Exception as e:
        print(f"❌ Error ejecutando comando: {e}")
        return False, str(e)

def verificar_git():
    """
    Verifica si Git está instalado y si estamos en un repositorio Git
    """
    print("🔍 Verificando Git...")
    
    # Verificar si Git está instalado
    exito, _ = ejecutar_comando("git --version", mostrar_salida=False)
    if not exito:
        print("❌ Git no está instalado o no está en el PATH")
        return False
    
    # Verificar si estamos en un repositorio Git
    exito, _ = ejecutar_comando("git status", mostrar_salida=False)
    if not exito:
        print("❌ No estás en un repositorio Git")
        return False
    
    print("✅ Git verificado correctamente")
    
    print("\n🔧 Configurando datos de usuario Git...")
    def get_cfg(key):
        ok, out = ejecutar_comando(f'git config --get {key}', mostrar_salida=False)
        return out.strip() if ok and out else ""
    uname = GIT_USERNAME or get_cfg("user.name")
    uemail = GIT_EMAIL or get_cfg("user.email")
    if uname:
        ejecutar_comando(f'git config user.name "{uname}"', mostrar_salida=False)
    if uemail:
        ejecutar_comando(f'git config user.email "{uemail}"', mostrar_salida=False)
    print(f"✅ Usuario configurado: {uname or '(sin nombre)'} ({uemail or 'sin email'})")
    
    return True

def verificar_cambios():
    """
    Verifica si hay cambios para commitear
    """
    print("\n🔍 Verificando cambios...")
    
    exito, salida = ejecutar_comando("git status --porcelain", mostrar_salida=False)
    if not exito:
        return False
    
    if not salida.strip():
        print("ℹ️  No hay cambios para commitear")
        return False
    
    # Mostrar estado actual
    print("📋 Estado actual del repositorio:")
    ejecutar_comando("git status")
    return True

def agregar_archivos():
    """
    Agrega todos los archivos al staging area
    """
    print("\n📁 Agregando archivos al staging area...")
    
    exito, _ = ejecutar_comando("git add -A")
    if exito:
        print("✅ Archivos agregados correctamente")
        return True
    else:
        print("❌ Error al agregar archivos")
        return False

def hacer_commit(mensaje):
    """
    Realiza el commit con el mensaje proporcionado
    """
    print(f"\n💾 Realizando commit: '{mensaje}'...")
    
    # Escapar comillas en el mensaje
    mensaje_escapado = mensaje.replace('"', '\\"')
    comando = f'git commit -m "{mensaje_escapado}"'
    
    exito, _ = ejecutar_comando(comando)
    if exito:
        print("✅ Commit realizado correctamente")
        return True
    else:
        print("❌ Error al realizar commit")
        return False

def hacer_push():
    """
    Realiza el push al repositorio remoto
    """
    print("\n🚀 Subiendo cambios al repositorio remoto...")
    def get_branch():
        ok, out = ejecutar_comando("git rev-parse --abbrev-ref HEAD", mostrar_salida=False)
        return out.strip() if ok and out else "main"
    def get_origin():
        ok, out = ejecutar_comando("git remote get-url origin", mostrar_salida=False)
        return out.strip() if ok and out else ""
    def parse_remote(u):
        u = u.strip()
        if not u:
            return ("", "")
        if u.startswith("git@github.com:"):
            path = u.split(":",1)[1]
        elif u.startswith("https://github.com/") or u.startswith("http://github.com/"):
            path = u.split("github.com/",1)[1]
        else:
            path = u
        path = path[:-4] if path.endswith(".git") else path
        parts = path.split("/")
        if len(parts) >= 2:
            return (parts[0], parts[1])
        return ("", "")

    branch = get_branch()
    origin = get_origin()
    owner, repo = parse_remote(origin)
    if not origin and GITHUB_REPO:
        if "/" in GITHUB_REPO:
            owner, repo = GITHUB_REPO.split("/",1)
        else:
            owner = GIT_USERNAME or os.environ.get("GITHUB_USERNAME") or ""
            repo = GITHUB_REPO
        if owner and repo:
            url = f"https://github.com/{owner}/{repo}.git"
            ejecutar_comando(f"git remote add origin {url}", mostrar_salida=False)
            origin = url

    if GITHUB_TOKEN and owner and repo:
        push_url = f"https://{owner}:{GITHUB_TOKEN}@github.com/{owner}/{repo}.git"
        cmd = f"git push {push_url} HEAD:{branch}"
        ok, _ = ejecutar_comando(cmd)
        if ok:
            print("✅ Cambios subidos correctamente a GitHub (con token)")
            return True
        print("❌ Error al subir con token, intentando push estándar...")

    ok, _ = ejecutar_comando("git push")
    if ok:
        print("✅ Cambios subidos correctamente a GitHub")
        return True
    print("❌ Error al subir cambios")
    print("💡 Tip: Exporta GITHUB_TOKEN y GITHUB_USERNAME o configura origin")
    return False

def obtener_mensaje_commit():
    """
    Solicita al usuario el mensaje del commit
    """
    print("\n" + "="*50)
    print("🎯 SUBIDA AUTOMÁTICA A GIT")
    print("="*50)
    
    while True:
        mensaje = input("\n📝 Ingresa el mensaje del commit: ").strip()
        
        if not mensaje:
            print("❌ El mensaje no puede estar vacío")
            continue
        
        if len(mensaje) < 3:
            print("❌ El mensaje debe tener al menos 3 caracteres")
            continue
        
        # Mostrar confirmación
        print(f"\n📋 Mensaje del commit: '{mensaje}'")
        confirmacion = input("¿Continuar? (s/n): ").strip().lower()
        
        if confirmacion in ['s', 'si', 'sí', 'y', 'yes']:
            return mensaje
        elif confirmacion in ['n', 'no']:
            print("❌ Operación cancelada por el usuario")
            return None
        else:
            print("❌ Respuesta no válida. Usa 's' para sí o 'n' para no")

def main():
    """
    Función principal del script
    """
    try:
        # Verificar Git
        if not verificar_git():
            return 1
        
        # Verificar cambios
        if not verificar_cambios():
            return 0
        
        # Obtener mensaje del commit
        mensaje = obtener_mensaje_commit()
        if not mensaje:
            return 1
        
        # Proceso automático
        print(f"\n🔄 Iniciando proceso automático...")
        print(f"⏰ Hora: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Agregar archivos
        if not agregar_archivos():
            return 1
        
        # Hacer commit
        if not hacer_commit(mensaje):
            return 1
        
        # Hacer push
        if not hacer_push():
            return 1
        
        # Éxito
        print("\n" + "="*50)
        print("🎉 ¡PROCESO COMPLETADO EXITOSAMENTE!")
        print("="*50)
        print("✅ Todos los cambios han sido subidos a GitHub")
        print(f"📝 Commit: '{mensaje}'")
        print(f"⏰ Completado: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        return 0
    
    except KeyboardInterrupt:
        print("\n\n❌ Proceso interrumpido por el usuario")
        return 1
    except Exception as e:
        print(f"\n❌ Error inesperado: {e}")
        return 1

if __name__ == "__main__":
    exit_code = main()
    
    # Pausa para que el usuario pueda ver el resultado
    input("\n🔚 Presiona Enter para salir...")
    sys.exit(exit_code)