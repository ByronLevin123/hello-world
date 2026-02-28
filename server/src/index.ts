import { app } from './app';
import { config } from './config';
import { pool } from './db/connection';
import { logger } from './lib/logger';

const server = app.listen(config.port, () => {
  logger.info({ port: config.port, env: config.nodeEnv }, 'Server started');
});

function gracefulShutdown(signal: string) {
  logger.info({ signal }, 'Graceful shutdown initiated');
  server.close(() => {
    pool.end().then(() => {
      logger.info('Database pool closed');
      process.exit(0);
    });
  });
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.fatal({ err: reason }, 'Unhandled promise rejection');
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught exception');
  process.exit(1);
});
