import postgres from '@prisma/orm-postgres/runtime';
import { contractFromJson } from '@prisma/orm-postgres/static';

import contractJson from '../prisma/contract.json' with { type: 'json' };
import { databaseUrl } from './env.js';

export const contract = contractFromJson(contractJson);
export const db = postgres({ contract, url: databaseUrl });

export async function healthCheck() {
  if (!databaseUrl) {
    return { connected: false, reason: 'DIRECT_URL/DATABASE_URL is not configured' };
  }

  try {
    await db.orm.public.User.select('id').limit(1).all();
    return { connected: true };
  } catch (err) {
    return { connected: false, reason: err.message };
  }
}

export async function closePool() {
  await db.close();
}

export default db;
