import os
import socket
import subprocess
import time
import webbrowser
from pathlib import Path
import shutil
import json
import urllib.request

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

def start_dev_proc(port: int):
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
    print(f'Servidor iniciado en {url}')
    return proc

def start_ngrok(port: int):
    root = find_root()
    exe = shutil.which('ngrok')
    if not exe:
        raise RuntimeError('No se encontró ngrok en PATH. Instálalo desde https://ngrok.com/')
    cmd = [exe, 'http', str(port)]
    env = os.environ.copy()
    proc = subprocess.Popen(cmd, cwd=str(root), env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)
    url = None
    for _ in range(60):
        time.sleep(0.5)
        try:
            with urllib.request.urlopen('http://127.0.0.1:4040/api/tunnels', timeout=1) as r:
                data = json.loads(r.read().decode('utf-8'))
                tunnels = data.get('tunnels', [])
                chosen = None
                for t in tunnels:
                    if t.get('proto') == 'https':
                        chosen = t.get('public_url')
                        break
                    if t.get('proto') == 'http' and not chosen:
                        chosen = t.get('public_url')
                if chosen:
                    url = chosen
                    break
        except Exception:
            pass
    if not url:
        url = 'http://127.0.0.1:4040/'
    print(f'Ngrok iniciado: {url}')
    try:
        webbrowser.open(url)
    except Exception:
        pass
    return proc, url

def main():
    preferred = 5173
    port = preferred if is_port_free(preferred) else next((p for p in [5174, 5175, 3000] if is_port_free(p)), preferred)
    dev_proc = start_dev_proc(port)
    ngrok_proc = None
    try:
        ngrok_proc, public = start_ngrok(port)
        print(f'URL pública: {public}')
    except Exception as e:
        print(str(e))
    try:
        dev_proc.wait()
    except KeyboardInterrupt:
        dev_proc.terminate()
        if ngrok_proc:
            ngrok_proc.terminate()

if __name__ == '__main__':
    main()