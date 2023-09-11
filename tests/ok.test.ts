import { setupApp } from '@/api/routes';

describe('Can run tests', () => {
  it('should pass', () => {
    expect(true).toBe(true);
  });
});

describe('Can receive requests on HTTP server', () => {
  const app = setupApp();

  afterAll(() => app.stop());

  it('/ should be ok', async () => {
    const response = await app
      .handle(new Request('http://localhost/'))
      .then((res) => res.text());

    expect(response).toBe('ok');
  });
});
