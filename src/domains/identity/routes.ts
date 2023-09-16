import { beginAuthentication } from '@/domains/identity/handlers';
import { Router } from 'express';

export async function createIdentityRouter(): Promise<Router> {
  const router = Router();

  router.post('/auth/begin', beginAuthentication);

  return router;
}
