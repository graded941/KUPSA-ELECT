import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import express from 'express';

import app from './src/server/api.js';
import { NotificationOutbox } from './src/server/notification-outbox.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = 3000;

// Background retry processor for notification outbox (every 60 seconds)
setInterval(async () => {
  try {
    const processed = await NotificationOutbox.processDue(25);
    if (processed > 0) {
      console.log(`[NotificationOutbox Worker] Processed ${processed} due outbox notification(s).`);
    }
  } catch (err: any) {
    console.error('[NotificationOutbox Worker Error]', err);
  }
}, 60000);

// Development Vite Middleware or Production Static Serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`KUPSA Electoral Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});

export default app;
