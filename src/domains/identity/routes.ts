import {
  beginAuthentication,
  completeAuthentication,
  refreshAuthentication,
} from '@/domains/identity/handlers';
import { Router } from 'express';

export async function createIdentityRouter(): Promise<Router> {
  const router = Router();

  router.post('/auth/begin', beginAuthentication);
  router.post('/auth/complete', completeAuthentication);
  router.post('/auth/refresh', refreshAuthentication);

  return router;
}
