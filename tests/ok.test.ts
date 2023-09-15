import { setupApp } from '@/global/app';
import { Express } from 'express';
import request from 'supertest';

describe('Can run tests', () => {
  it('should pass', () => {
    expect(true).toBe(true);
  });
});

describe('HTTP server', () => {
  let app: Express;

  beforeAll(() => {
    app = setupApp();
  });

  it('should return ok', async () => {
    const response = await request(app)
      .get('/')
      .expect(200)
      .then((res) => res.text);

    expect(response).toBe('ok');
  });
});
