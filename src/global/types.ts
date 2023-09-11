import { Logger } from 'pino';

export interface ExecutionContext {
  request: Request;
  log: Logger;
}
