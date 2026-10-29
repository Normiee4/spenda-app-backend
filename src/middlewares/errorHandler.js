import { nodeEnv } from '../config/env.js';
import * as logger from '../utils/logger.js';

function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  const statusCode = err.statusCode || err.status || 500;
  const isOperational = err.isOperational || statusCode < 500;

  if (!isOperational) {
    logger.error(`${req.method} ${req.originalUrl} failed`, err);
  }

  res.status(statusCode).json({
    success: false,
    message: isOperational ? err.message : 'Internal server error',
    ...(err.details ? { details: err.details } : {}),
    ...(nodeEnv === 'development' && !isOperational ? { stack: err.stack } : {}),
  });
}

export default errorHandler;
