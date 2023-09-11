import { ExecutionContext } from '@/global/types';

export function register(context: ExecutionContext): void {
  const someObj = {
    foo: 'bar',
  };

  context.log.info(someObj, 'register');
}

export function verify(context: ExecutionContext): void {
  const someObj = {
    foo: 'bar',
  };

  context.log.info(someObj, 'verify');
}
