import express, { json, urlencoded } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';

import { corsOrigin, nodeEnv } from './config/env.js';
import globalError from './middlewares/error-handler.js';
import apiRateLimiter from './middlewares/rate-limiter.js';

const app = express();

app.disable('x-powered-by');

// Needed behind a proxy (Supabase/Render/etc.) so req.ip is the real client.
app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: corsOrigin === '*' ? true : corsOrigin.split(',').map((origin) => origin.trim()),
    credentials: true,
  }),
);
app.use(compression());

if (nodeEnv !== 'test') {
  app.use(morgan(nodeEnv === 'production' ? 'combined' : 'dev'));
}

// Rate limit before body parsing so rejected requests are cheap.
app.use(apiRateLimiter());

app.use(json({ limit: '1mb' }));
app.use(urlencoded({ extended: true, limit: '1mb' }));

// Mount routes here.

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found` });
});

app.use(globalError);

export default app;
