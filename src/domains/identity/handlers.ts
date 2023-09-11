import { ExecutionContext } from '@/global/types';

export function register(context: ExecutionContext): void {
  const someObj = {
    foo: 'bar',
  };

  context.getLogger().info(someObj, 'register');
}

export function verify(context: ExecutionContext): void {
  const someObj = {
    foo: 'bar',
  };

  context.getLogger().info(someObj, 'verify');
}
