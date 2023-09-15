import express, { Express, Request, Response } from 'express';

// Disabling require return type rule for this because of the nature of chaining API derived types.
export const setupApp = (): Express => {
  const app = express();

  app.get('/', (req: Request, res: Response) => res.send('ok'));

  return app;
};
