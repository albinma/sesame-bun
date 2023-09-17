import { createIdentityRouter } from '@/domains/identity/routes';
import { logger } from '@/shared/initializers/logger';
import { createSession } from '@/shared/initializers/session';
import { errorHandlerMiddleware } from '@/shared/middlewares';
import compression from 'compression';
import express, { Express, Request, Response, json } from 'express';
import { middleware as OpenApiValidatorMiddlware } from 'express-openapi-validator';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { v4 } from 'uuid';

const OPEN_API_SPEC = 'data/openapi/openapi.yml';

// Disabling require return type rule for this because of the nature of chaining API derived types.
export const setupApp = async (): Promise<Express> => {
  const app = express();

  app.use(
    helmet({
      // Disable CSP because it's not needed for this API only project.
      contentSecurityPolicy: false,
    }),
  );

  app.use(compression());

  app.use(createSession());

  // Generate request id that will correlate all logs for a single request.
  app.use((req, res, next) => {
    req.id = v4();
    res.set('X-Request-Id', req.id);
    next();
  });

  app.use(
    pinoHttp({
      logger,
      quietReqLogger: true,
      genReqId: (req) => req.id,
    }),
  );

  app.use(json());

  app.get('/', (req: Request, res: Response) => {
    res.send('ok');
  });

  app.use(
    OpenApiValidatorMiddlware({
      apiSpec: OPEN_API_SPEC,
      validateApiSpec: false,
      validateRequests: true,
      validateResponses: true,
    }),
  );

  app.use(await createIdentityRouter());
  app.use(errorHandlerMiddleware());

  return app;
};
