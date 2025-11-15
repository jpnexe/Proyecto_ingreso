import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

function sqliteApiPlugin() {
  return {
    name: 'sqlite-api',
    configureServer(server) {
      const dataDir = path.resolve(process.cwd(), 'data');
      const filePath = path.join(dataDir, 'dashboard.sqlite');
      server.middlewares.use('/api/sqlite', async (req, res, next) => {
        try {
          // Ensure directory exists
          await fs.promises.mkdir(dataDir, { recursive: true });
          if (req.method === 'GET') {
            if (fs.existsSync(filePath)) {
              const buf = await fs.promises.readFile(filePath);
              res.setHeader('Content-Type', 'application/octet-stream');
              res.setHeader('Cache-Control', 'no-store');
              res.statusCode = 200;
              res.end(buf);
            } else {
              res.statusCode = 404;
              res.end('not found');
            }
            return;
          }
          if (req.method === 'POST') {
            const chunks = [];
            req.on('data', (c) => chunks.push(c));
            req.on('end', async () => {
              const buf = Buffer.concat(chunks);
              await fs.promises.writeFile(filePath, buf);
              res.statusCode = 200;
              res.end('ok');
            });
            return;
          }
          if (req.method === 'DELETE') {
            try {
              await fs.promises.unlink(filePath);
            } catch (_) {}
            res.statusCode = 200;
            res.end('deleted');
            return;
          }
          next();
        } catch (e) {
          res.statusCode = 500;
          res.end('error');
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [sqliteApiPlugin()],
  server: {
    host: 'localhost',
    port: 5173,
    strictPort: true,
    open: false,
    allowedHosts: ['.ngrok-free.app'],
    hmr: {
      clientPort: 443,
      protocol: 'wss'
    }
  },
  preview: {
    port: 5173,
    strictPort: true,
  },
});