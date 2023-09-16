export type SupportedHttpStatusCode = 400 | 401 | 403 | 404 | 422 | 500;

/**
 * ApplicationError
 * @description Custom error class for application errors
 */
export abstract class ApplicationError extends Error {
  code: string;
  status: SupportedHttpStatusCode;
  data?: Record<string, unknown>;

  constructor(
    code: string,
    status: SupportedHttpStatusCode,
    message: string,
    data?: Record<string, unknown>,
  ) {
    super(message);
    this.code = code;
    this.data = data;
    this.status = status;
  }
}
