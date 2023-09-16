import { ApplicationError } from '@/shared/errors/application-error';

export class ValidationError extends ApplicationError {
  public static CODE = 'err_validation';

  constructor(name: string, reason: string);
  constructor(errors: Array<{ name: string; reason: string }>);
  constructor(...arr: unknown[]) {
    const [name, reason] = arr;
    let errors: Array<{ name: string; reason: string }> = [];

    if (typeof name === 'string' && typeof reason === 'string') {
      errors.push({ name, reason });
    } else {
      errors = name as Array<{ name: string; reason: string }>;
    }

    super(ValidationError.CODE, 400, 'One or more validation errors occurred', {
      errors,
    });
  }
}
