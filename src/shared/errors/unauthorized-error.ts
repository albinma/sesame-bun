import { ApplicationError } from '@/shared/errors';

export class UnauthorizedError extends ApplicationError {
  public static CODE = 'err_unauthorized';
  constructor() {
    super(UnauthorizedError.CODE, 401, 'Unauthorized');
  }
}
