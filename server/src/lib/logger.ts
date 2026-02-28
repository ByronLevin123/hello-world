import pino from 'pino';
import { config } from '../config';

export const logger = pino({
  level: config.nodeEnv === 'production' ? 'info' : 'debug',
  transport: config.nodeEnv !== 'production' ? { target: 'pino/file', options: { destination: 1 } } : undefined,
  formatters: {
    level(label) {
      return { level: label };
    },
  },
  base: { service: 'uk-loan-journey' },
});
