import os
import socket
import subprocess
import time
import webbrowser
from pathlib import Path


def find_root() -> Path:
    here = Path(__file__).resolve()
    candidates = [here.parent, here.parent.parent, Path.cwd()]
    for c in candidates:
        if (c / 'package.json').exists():
            return c
    return Path.cwd()


def is_port_free(port: int) -> bool:
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(0.3)
    try:
        return s.connect_ex(('127.0.0.1', port)) != 0
    finally:
        s.close()


def start_dev(port: int):
    root = find_root()
    vite_bin = root / 'node_modules' / 'vite' / 'bin' / 'vite.js'
    if not vite_bin.exists():
        raise RuntimeError('No se encontró vite en node_modules. Instala dependencias primero (npm install).')
    cmd = ['node', str(vite_bin), '--port', str(port), '--strictPort']
    env = os.environ.copy()
    proc = subprocess.Popen(cmd, cwd=str(root), env=env)
    time.sleep(1.5)
    url = f'http://localhost:{port}/'
    try:
        webbrowser.open(url)
    except Exception:
        pass
    print(f'Servidor iniciado en {url}\n(CTRL+C para detener)')
    try:
        proc.wait()
    except KeyboardInterrupt:
        proc.terminate()


def main():
    preferred = 5173
    port = preferred if is_port_free(preferred) else next((p for p in [5174, 5175, 3000] if is_port_free(p)), preferred)
    start_dev(port)


if __name__ == '__main__':
    main()