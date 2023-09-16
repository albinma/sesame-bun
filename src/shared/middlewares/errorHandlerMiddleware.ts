/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { APP_CONFIGURATION } from '@/shared/configs/config';
import { ApplicationError, SupportedHttpStatusCode } from '@/shared/errors';
import { Problem } from '@/shared/types';
import { ErrorRequestHandler } from 'express';

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
      type: 'about:blank',
      status: 500,
      title: 'Internal Server Error',
      detail: err?.message ?? 'An unknown error occurred',
      instance: req.url,
      ...{
        stack: APP_CONFIGURATION.environment !== 'production' ? err.stack : {},
      },
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

    res
      .status(problem.status)
      .contentType('application/json+problem')
      .send(problem);
  };
}
