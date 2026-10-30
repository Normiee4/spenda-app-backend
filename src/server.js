import { createServer } from 'http';

import app from './app.js';
import { port, nodeEnv } from './config/env.js';

function health(req, res) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(
    JSON.stringify({
      success: true,
      status: 'ok',
      service: 'spenda-backend',
      environment: nodeEnv,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    }),
  );
}

const server = createServer((req, res) => {
  const pathname = req.url.split('?')[0];
  if (req.method === 'GET' && pathname === '/health') return health(req, res);
  return app(req, res);
});

server.on('error', (err) => {
  console.error('Server error:', err.message);
  process.exit(1);
});

server.listen(port, () => {
  console.log(`Server listening on http://localhost:${port} (${nodeEnv})`);
});

function shutdown(signal) {
  console.log(`${signal} received, shutting down gracefully...`);

  server.close(() => {
    process.exit(0);
  });

  server.closeIdleConnections?.();

  setTimeout(() => process.exit(1), 10000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

export default server;
