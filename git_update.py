#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para actualizar el proyecto desde Git
Autor: Asistente IA
Descripción: Este script automatiza el proceso de git pull para actualizar
             el proyecto con los últimos cambios del repositorio remoto.
"""

import subprocess
import sys
import os
from datetime import datetime

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
    return True

def verificar_remoto():
    """
    Verifica si hay un repositorio remoto configurado
    """
    print("🔍 Verificando repositorio remoto...")
    
    exito, salida = ejecutar_comando("git remote -v", mostrar_salida=False)
    if not exito or not salida.strip():
        print("❌ No hay repositorios remotos configurados")
        return False
    
    print("✅ Repositorio remoto encontrado:")
    print(salida)
    return True

def guardar_cambios_locales():
    """
    Guarda los cambios locales en un stash temporal
    """
    print("\n📦 Guardando cambios locales temporales...")
    
    # Verificar si hay cambios no commiteados
    exito, salida = ejecutar_comando("git status --porcelain", mostrar_salida=False)
    if not exito:
        return False
    
    if salida.strip():
        # Hay cambios, guardarlos en stash
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        stash_mensaje = f"auto_stash_{timestamp}"
        
        exito, _ = ejecutar_comando(f'git stash save "{stash_mensaje}"')
        if exito:
            print(f"✅ Cambios locales guardados temporalmente como: {stash_mensaje}")
            return True
        else:
            print("❌ Error al guardar cambios locales")
            return False
    else:
        print("ℹ️  No hay cambios locales que guardar")
        return True

def actualizar_proyecto():
    """
    Realiza el pull de los cambios desde el repositorio remoto
    """
    print("\n🔄 Actualizando proyecto desde Git...")
    
    exito, salida = ejecutar_comando("git pull")
    if exito:
        print("✅ Proyecto actualizado correctamente")
        
        # Mostrar resumen de cambios
        if salida.strip() and "Already up to date" not in salida:
            print("\n📋 Cambios descargados:")
            print(salida)
        elif "Already up to date" in salida:
            print("ℹ️  El proyecto ya está actualizado")
        
        return True
    else:
        print("❌ Error al actualizar el proyecto")
        return False

def mostrar_estado_final():
    """
    Muestra el estado final del repositorio
    """
    print("\n📊 Estado final del repositorio:")
    ejecutar_comando("git status")

def confirmar_actualizacion():
    """
    Solicita confirmación al usuario antes de actualizar
    """
    print("\n" + "="*50)
    print("🎯 ACTUALIZACIÓN AUTOMÁTICA DESDE GIT")
    print("="*50)
    print("⚠️  Este proceso actualizará tu proyecto con los cambios")
    print("   más recientes del repositorio remoto.")
    print("   Los cambios locales no commiteados se guardarán temporalmente.")
    print()
    
    while True:
        confirmacion = input("¿Deseas continuar con la actualización? (s/n): ").strip().lower()
        
        if confirmacion in ['s', 'si', 'sí', 'y', 'yes']:
            return True
        elif confirmacion in ['n', 'no']:
            print("❌ Operación cancelada por el usuario")
            return False
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
        
        # Verificar repositorio remoto
        if not verificar_remoto():
            return 1
        
        # Confirmar actualización
        if not confirmar_actualizacion():
            return 1
        
        # Proceso automático
        print(f"\n🔄 Iniciando actualización automática...")
        print(f"⏰ Hora: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Guardar cambios locales
        if not guardar_cambios_locales():
            return 1
        
        # Actualizar proyecto
        if not actualizar_proyecto():
            return 1
        
        # Mostrar estado final
        mostrar_estado_final()
        
        # Éxito
        print("\n" + "="*50)
        print("🎉 ¡ACTUALIZACIÓN COMPLETADA EXITOSAMENTE!")
        print("="*50)
        print("✅ Tu proyecto ha sido actualizado con los últimos cambios")
        print("   del repositorio remoto.")
        print(f"⏰ Completado: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print()
        print("💡 Si tenías cambios locales, se han guardado temporalmente.")
        print("   Puedes recuperarlos con: git stash pop")
        
        return 0
        
    except KeyboardInterrupt:
        print("\n\n❌ Operación cancelada por el usuario (Ctrl+C)")
        return 1
    except Exception as e:
        print(f"\n❌ Error inesperado: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())