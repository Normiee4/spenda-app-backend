const env = require('../config/env');

const levels = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel = levels[process.env.LOG_LEVEL] ?? levels.info;

function log(level, message, meta) {
  if (levels[level] > currentLevel) return;

  const entry = {
    level,
    time: new Date().toISOString(),
    message,
    ...(meta instanceof Error
      ? { error: { name: meta.name, message: meta.message, stack: env.nodeEnv === 'development' ? meta.stack : undefined } }
      : meta),
  };

  const output = env.nodeEnv === 'production' ? JSON.stringify(entry) : `[${entry.time}] ${level.toUpperCase()} ${message}`;
  console[level === 'error' ? 'error' : 'log'](output, env.nodeEnv === 'production' ? '' : meta ?? '');
}

module.exports = {
  error: (message, meta) => log('error', message, meta),
  warn: (message, meta) => log('warn', message, meta),
  info: (message, meta) => log('info', message, meta),
  debug: (message, meta) => log('debug', message, meta),
};
