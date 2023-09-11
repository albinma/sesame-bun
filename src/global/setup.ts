import { logger } from '@/shared/initializers/logger';
import Elysia from 'elysia';

// Used to setup common decorators and type definitions
// https://elysiajs.com/patterns/dependency-injection.html
export const setup = new Elysia({ name: 'setup' }).decorate('log', logger);
