import { logLevel, nodeEnv } from '../config/env.js';

const levels = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel = levels[logLevel] ?? levels.info;

function log(level, message, meta) {
  if (levels[level] > currentLevel) return;

  const entry = {
    level,
    time: new Date().toISOString(),
    message,
    ...(meta instanceof Error
      ? {
          error: {
            name: meta.name,
            message: meta.message,
            stack: nodeEnv === 'development' ? meta.stack : undefined,
          },
        }
      : meta),
  };

  const output =
    nodeEnv === 'production' ? JSON.stringify(entry) : `[${entry.time}] ${level.toUpperCase()} ${message}`;

  console[level === 'error' ? 'error' : 'log'](output, nodeEnv === 'production' ? '' : meta ?? '');
}

export const error = (message, meta) => log('error', message, meta);
export const warn = (message, meta) => log('warn', message, meta);
export const info = (message, meta) => log('info', message, meta);
export const debug = (message, meta) => log('debug', message, meta);

export default { error, warn, info, debug };
