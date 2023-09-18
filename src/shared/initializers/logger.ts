import { APP_CONFIGURATION } from '@/shared/configs';
import { Logger, LoggerOptions, pino } from 'pino';

const createLogger = (options: LoggerOptions): Logger => {
  if (!options.level) {
    options.level = 'info';
  }

  return pino(options);
};

const { level } = APP_CONFIGURATION.logging;

export const logger = createLogger({ level });
