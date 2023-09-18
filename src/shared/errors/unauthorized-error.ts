import { ApplicationError } from '@/shared/errors';

export class UnauthorizedError extends ApplicationError {
  public static CODE = 'err_unauthorized';
  constructor(reason?: string) {
    super(UnauthorizedError.CODE, 401, 'Unauthorized', { detail: reason });
  }
}
