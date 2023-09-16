/* eslint-disable @typescript-eslint/no-explicit-any */
import { APP_CONFIGURATION } from '@/shared/configs/config';
import { ErrorRequestHandler } from 'express-serve-static-core';

export function errorHandlerMiddleware(): ErrorRequestHandler {
  return (err, req, res) => {
    res.status(err.status || 500).json({
      message: err.message,
      errors: err.errors,
      stack: APP_CONFIGURATION.environment !== 'production' ? err.stack : {},
    });
  };
}
