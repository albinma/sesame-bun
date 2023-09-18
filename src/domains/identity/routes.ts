import {
  beginAuthentication,
  completeAuthentication,
  refreshAuthentication,
} from '@/domains/identity/handlers';
import { createSession } from '@/shared/initializers/session';
import { contextWrapMiddleware } from '@/shared/middlewares';
import { Router } from 'express';

export async function createIdentityRouter(): Promise<Router> {
  const router = Router();
  router.use(createSession());

  router.post('/auth/begin', contextWrapMiddleware(beginAuthentication));

  router.post('/auth/complete', contextWrapMiddleware(completeAuthentication));

  router.post('/auth/refresh', contextWrapMiddleware(refreshAuthentication));

  return router;
}
