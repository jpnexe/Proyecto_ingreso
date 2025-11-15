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

# Configuración de cuenta Git
GIT_USERNAME = "David109754"
GIT_EMAIL = "ovettovar79@gmail.com"

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
    
    # Configurar datos de usuario Git
    print("\n🔧 Configurando datos de usuario Git...")
    ejecutar_comando(f'git config user.name "{GIT_USERNAME}"', mostrar_salida=False)
    ejecutar_comando(f'git config user.email "{GIT_EMAIL}"', mostrar_salida=False)
    print(f"✅ Usuario configurado: {GIT_USERNAME} ({GIT_EMAIL})")
    
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
    
    exito, _ = ejecutar_comando("git push")
    if exito:
        print("✅ Cambios subidos correctamente a GitHub")
        return True
    else:
        print("❌ Error al subir cambios")
        print("💡 Tip: Verifica tu conexión a internet y credenciales de Git")
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