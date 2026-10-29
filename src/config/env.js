import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const nodeEnv = process.env.NODE_ENV || 'development';
export const port = Number(process.env.PORT) || 4000;
export const logLevel = process.env.LOG_LEVEL || 'info';

const supabaseBaseUrl = (process.env.SUPABASE_URL || '').replace(/\/$/, '');

export const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL || '';
export const supabaseUrl = supabaseBaseUrl;
export const supabaseJwksUrl =
  process.env.SUPABASE_JWKS_URL ||
  (supabaseBaseUrl ? `${supabaseBaseUrl}/auth/v1/.well-known/jwks.json` : '');
export const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';
export const corsOrigin = process.env.CORS_ORIGIN || '*';

const required = ['DIRECT_URL'];

if (nodeEnv === 'production') {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

export default {
  nodeEnv,
  port,
  logLevel,
  databaseUrl,
  supabaseUrl,
  supabaseJwksUrl,
  supabaseServiceKey,
  corsOrigin,
};
