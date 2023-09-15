import { logger } from '@/shared/initializers/logger';
import express, { Express, Request, Response } from 'express';
import { pinoHttp } from 'pino-http';
import { v4 } from 'uuid';

// Disabling require return type rule for this because of the nature of chaining API derived types.
export const setupApp = (): Express => {
  const app = express();

  app.use(
    pinoHttp({
      logger,
      genReqId: () => v4(),
    }),
  );

  app.get('/', (req: Request, res: Response) => {
    req.log.info('hello world');
    res.send('ok');
  });

  return app;
};
