import { logger } from '@/shared/initializers/logger';
import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { v4 } from 'uuid';

// Disabling require return type rule for this because of the nature of chaining API derived types.
export const setupApp = (): Express => {
  const app = express();

  app.use(
    helmet({
      // Disable CSP because it's not needed for this API only project.
      contentSecurityPolicy: false,
    }),
  );

  app.use((req, res, next) => {
    req.id = v4();
    res.set('X-Request-Id', req.id);
    next();
  });

  app.use(
    pinoHttp({
      logger,
      genReqId: (req) => req.id,
    }),
  );

  app.get('/', (req: Request, res: Response) => {
    req.log.debug('hello world');
    res.send('ok');
  });

  return app;
};
