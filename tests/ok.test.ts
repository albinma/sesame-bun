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

  it('should have request id', async () => {
    const response = await request(app)
      .get('/')
      .expect(200)
      .then((res) => res.header['x-request-id']);

    expect(response).toBeDefined();
    expect(response).not.toBeNull();
  });

  it('should have security headers', async () => {
    const headers = await request(app)
      .get('/')
      .expect(200)
      .then((res) => res.headers);

    expect(headers).toBeDefined();
    expect(headers).not.toBeNull();
    expect(headers['cross-origin-opener-policy']).toBe('same-origin');
    expect(headers['cross-origin-resource-policy']).toBe('same-origin');
    expect(headers['referrer-policy']).toBe('no-referrer');
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-dns-prefetch-control']).toBe('off');
    expect(headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(headers['x-xss-protection']).toBe('0');
    expect(headers['x-download-options']).toBe('noopen');
    expect(headers['x-permitted-cross-domain-policies']).toBe('none');
    expect(headers['x-powered-by']).toBeUndefined();
  });
});
