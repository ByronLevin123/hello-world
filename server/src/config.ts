import dotenv from 'dotenv';
import { randomBytes } from 'crypto';
dotenv.config();

const defaultJwtSecret = process.env.NODE_ENV === 'production'
  ? undefined
  : 'dev-secret-do-not-use-in-production-' + randomBytes(16).toString('hex');

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  databaseUrl: process.env.DATABASE_URL || 'postgresql://localhost:5432/loan_journey',
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || defaultJwtSecret || (() => { throw new Error('JWT_SECRET is required in production'); })(),
  allowedOrigins: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim()) : [],
  pool: {
    max: parseInt(process.env.DB_POOL_MAX || '10', 10),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  },
};
