import { LoggerOptions } from '@bogeychan/elysia-logger/src/types';
import { Context } from 'elysia';
import { Logger } from 'pino';

export type CustomContext = Context & {
  log: Logger<Omit<LoggerOptions<'log'>, 'contextKeyName' | 'customProps'>>;
};
