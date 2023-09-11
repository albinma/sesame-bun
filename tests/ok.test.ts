import { setupApp } from '@/api/routes';

describe('Can run tests', () => {
  it('should pass', () => {
    expect(true).toBe(true);
  });
});

describe('HTTP server', () => {
  const port = Bun.env.HTTP_PORT || 8080;
  const app = setupApp().listen(port);

  afterAll(() => app.stop());

  it('should return ok', async () => {
    const response = await app
      .handle(new Request('http://localhost/'))
      .then((res) => res.text());

    expect(response).toBe('ok');
  });
});
