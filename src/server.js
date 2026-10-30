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
  if (req.method === 'GET' && req.url === '/health') return health(req, res);
  return app(req, res);
});

server.listen(port, () => {
  console.log(`Server listening on http://localhost:${port} (${nodeEnv})`);
});

function shutdown(signal) {
  console.log(`${signal} received, shutting down gracefully...`);

  server.close(() => {
    process.exit(0);
  });

  setTimeout(() => process.exit(1), 10000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

export default server;
