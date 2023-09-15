import { Logger, LoggerOptions, pino } from 'pino';

const createLogger = (options: LoggerOptions): Logger => {
  if (!options.level) {
    options.level = 'info';
  }

  return pino(options);
};

export const logger = createLogger({ level: Bun.env.LOG_LEVEL });
