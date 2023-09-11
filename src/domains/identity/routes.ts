import { CustomContext } from '@/api/types';
import { register } from '@/domains/identity/handler';
import Elysia from 'elysia';

export const authRoutes = new Elysia({ prefix: '/auth' });

authRoutes.post('/register', (context) => register(context as CustomContext));
