import { Pool } from 'pg';
import { config } from '../config';

const isRemote = config.databaseUrl.includes('supabase.co') || config.databaseUrl.includes('neon.tech');

export const pool = new Pool({
  connectionString: config.databaseUrl,
  max: config.pool.max,
  idleTimeoutMillis: config.pool.idleTimeoutMillis,
  connectionTimeoutMillis: config.pool.connectionTimeoutMillis,
  ...(isRemote ? { ssl: { rejectUnauthorized: false } } : {}),
});

pool.on('error', (err) => {
  console.error('[DB Pool] Unexpected error on idle client:', err.message);
});
