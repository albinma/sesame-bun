import { CLIENT_CONFIGURATION } from '@/shared/configs';
import { UnauthorizedError } from '@/shared/errors';
import { NextFunction, Request, RequestHandler, Response } from 'express';

export function clientBasicAuthentication(): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const authorization = req.headers.authorization;
      if (!authorization) {
        throw new UnauthorizedError('Authorization header is missing');
      }

      const [scheme, token] = authorization.split(' ');
      if (scheme !== 'Basic' || !token) {
        throw new UnauthorizedError('Invalid authorization scheme');
      }

      const [clientId, clientSecret] = Buffer.from(token, 'base64')
        .toString()
        .split(':');

      if (!clientId || !clientSecret) {
        throw new UnauthorizedError('Invalid client credentials');
      }

      const { allowedClients } = CLIENT_CONFIGURATION;
      const inAllowedClients = allowedClients.some(
        (c) => c.clientId === clientId && c.clientSecret === clientSecret,
      );

      if (!inAllowedClients) {
        throw new UnauthorizedError('Invalid client credentials');
      }

      if (!res.headersSent) {
        next();
      }
    } catch (error) {
      next(error);
    }
  };
}
