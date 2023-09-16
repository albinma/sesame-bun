import { createIdentityRouter } from '@/domains/identity/routes';
import { APP_CONFIGURATION } from '@/shared/configs/config';
import { logger } from '@/shared/initializers/logger';
import { errorHandlerMiddleware } from '@/shared/middlewares';
import compression from 'compression';
import express, {
  ErrorRequestHandler,
  Express,
  Request,
  Response,
  json,
} from 'express';
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
      validateResponses: false,
    }),
  );

  app.use(await createIdentityRouter());

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    res.status(err.status || 500).json({
      message: err.message,
      errors: err.errors,
      stack: APP_CONFIGURATION.environment !== 'production' ? err.stack : {},
    });
  };

  // app.use(errorHandler);
  app.use(errorHandlerMiddleware());

  // app.use((err, req, res, next) => {
  //   res.status(err.status || 500).json({
  //     message: err.message,
  //     errors: err.errors,
  //     stack: APP_CONFIGURATION.environment !== 'production' ? err.stack : {},
  //   });
  // });

  return app;
};
