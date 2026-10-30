import express, { json, urlencoded } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';

import { corsOrigin, nodeEnv } from './config/env.js';

const app = express();

app.disable('x-powered-by');

app.use(helmet());
app.use(
  cors({
    origin: corsOrigin === '*' ? true : corsOrigin.split(',').map((origin) => origin.trim()),
    credentials: true,
  }),
);
app.use(compression());
app.use(json({ limit: '1mb' }));
app.use(urlencoded({ extended: true, limit: '1mb' }));

if (nodeEnv !== 'test') {
  app.use(morgan(nodeEnv === 'production' ? 'combined' : 'dev'));
}

// Mount routes here.

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found` });
});

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);

  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: statusCode < 500 ? err.message : 'Internal server error',
  });
});

export default app;
