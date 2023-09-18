/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApplicationError, SupportedHttpStatusCode } from '@/shared/errors';
import { Problem } from '@/shared/types';
import { ErrorRequestHandler } from 'express';
import { HttpError } from 'express-openapi-validator/dist/framework/types';

const titleMap = new Map<SupportedHttpStatusCode, string>([
  [400, 'Bad Request'],
  [401, 'Unauthorized'],
  [403, 'Forbidden'],
  [404, 'Not Found'],
  [422, 'Unprocessable Entity'],
  [500, 'Internal Server Error'],
]);

export function errorHandlerMiddleware(): ErrorRequestHandler {
  return (err, req, res, next) => {
    let problem: Problem = {
      type: err.type ?? 'about:blank',
      status: err.status ?? 500,
      title: 'Internal Server Error',
      detail: err?.message ?? 'An unknown error occurred',
      instance: req.protocol + '://' + req.get('host') + req.originalUrl,
    };

    if (err instanceof ApplicationError) {
      const { code, status, message, data } = err;
      const title = titleMap.get(status);

      problem = {
        ...problem,
        type: code,
        title: title || problem.title,
        status,
        detail: message,
        ...data,
      };
    }
    // OpenAPI Validator Error
    else if (err instanceof HttpError) {
      const { status, message, errors } = err;
      const mappedErrors = errors.map((error) => ({
        name: error.path,
        reason: error.message,
      }));
      problem = {
        ...problem,
        type: 'err_http',
        title: message,
        status,
        detail: message,
        ...{ errors: mappedErrors },
      };
    }

    res
      .status(problem.status)
      .contentType('application/json+problem')
      .send(problem);
  };
}
