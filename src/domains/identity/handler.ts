import { CustomContext } from '@/api/types';

export function register(context: CustomContext): string {
  context.log.info(context, 'register');

  return 'ok';
}
