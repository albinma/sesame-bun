import { Context } from 'elysia';
import { Logger, LoggerOptions, pino, stdSerializers } from 'pino';

const isContext = (object: unknown): boolean => {
  const context = object as Context;

  if (context.request && context.store) {
    return true;
  }

  return false;
};

const isRequest = (object: unknown): boolean => {
  const request = object as Request;

  if (request.url && request.method) {
    return true;
  }

  return false;
};

const serializeRequest = (
  request: Request,
): { method: string; url: string; referrer: string; headers: Headers } => {
  const { method, url, referrer, headers } = request;
  return {
    method,
    url,
    referrer,
    headers,
  };
};

const serializers: LoggerOptions['serializers'] = {
  request: serializeRequest,
  err: stdSerializers.err,
};

const formatters = {
  log(object) {
    if (isContext(object)) {
      const context = object as unknown as Context;
      return { request: context.request };
    } else if (isRequest(object)) {
      return serializeRequest(object as unknown as Request);
    }
    return object;
  },
} satisfies LoggerOptions['formatters'];

const createLogger = (options: LoggerOptions): Logger => {
  if (!options.level) {
    options.level = 'info';
  }

  if (!options.formatters) {
    options.formatters = formatters;
  }

  if (!options.serializers) {
    options.serializers = serializers;
  }

  return pino(options);
};

export const logger = createLogger({ level: Bun.env.LOG_LEVEL });
