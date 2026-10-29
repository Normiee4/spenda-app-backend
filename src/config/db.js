import { Pool } from 'pg';
import { debug, error } from '../utils/logger';
import { databaseUrl, nodeEnv } from './env';

let pool = null;

function getPool() {
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not configured. Set it in .env to connect PostgreSQL/Supabase.');
  }

  if (!pool) {
    pool = new Pool({
      connectionString: databaseUrl,
      ssl: nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
    });

    pool.on('error', (err) => {
      error('Unexpected PostgreSQL pool error', err);
    });
  }

  return pool;
}

async function query(text, params) {
  const start = Date.now();
  const result = await getPool().query(text, params);
  const duration = Date.now() - start;

  if (nodeEnv === 'development') {
    debug('db.query', { duration, rows: result.rowCount });
  }

  return result;
}

async function healthCheck() {
  if (!databaseUrl) return { connected: false, reason: 'DATABASE_URL not set' };
  try {
    await query('SELECT 1');
    return { connected: true };
  } catch (err) {
    return { connected: false, reason: err.message };
  }
}

async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

export default { getPool, query, healthCheck, closePool };
