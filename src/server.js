import { createServer } from 'http';

import app from './app.js';
import { port, nodeEnv } from './config/env.js';
import { closePool } from './config/db.js';
import { info, error } from './utils/logger.js';

const server = createServer(app);

server.listen(port, () => {
  info(`Server listening on http://localhost:${port} (${nodeEnv})`);
});

async function shutdown(signal) {
  info(`${signal} received, shutting down gracefully...`);

  server.close(async () => {
    try {
      await closePool();
      info('HTTP server and database pool closed');
      process.exit(0);
    } catch (err) {
      error('Error during shutdown', err);
      process.exit(1);
    }
  });

  setTimeout(() => {
    error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('unhandledRejection', (reason) => {
  error('Unhandled rejection', reason instanceof Error ? reason : { reason });
});

process.on('uncaughtException', (err) => {
  error('Uncaught exception', err);
  shutdown('uncaughtException');
});

export default server;
