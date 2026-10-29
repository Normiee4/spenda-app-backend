import express, { json, urlencoded } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';

import { corsOrigin, nodeEnv } from './config/env';
import { healthCheck } from './config/db';
import routes from './routes';
import { apiLimiter } from './middlewares/rateLimiter';
import notFound from './middlewares/notFound';
import errorHandler from './middlewares/errorHandler';

const app = express();

app.disable('x-powered-by');

app.use(helmet());
app.use(
  cors({
    origin: corsOrigin === '*' ? true : corsOrigin.split(',').map((o) => o.trim()),
    credentials: true,
  })
);
app.use(compression());
app.use(json({ limit: '1mb' }));
app.use(urlencoded({ extended: true, limit: '1mb' }));

if (nodeEnv !== 'test') {
  app.use(morgan(nodeEnv === 'production' ? 'combined' : 'dev'));
}

app.use('/api', apiLimiter);

app.get('/health', async (req, res) => {
  const database = await healthCheck();
  res.status(200).json({
    success: true,
    status: 'ok',
    service: 'spenda-backend',
    environment: nodeEnv,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database,
  });
});

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Spenda API', docs: '/api', health: '/health' });
});

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

export default app;
