import { register, verify } from '@/domains/identity/handlers';
import { setup } from '@/global/setup';
import Elysia from 'elysia';

export const authRoutes = new Elysia()
  .use(setup)
  .post('/register', register)
  .post('/verify', verify);
