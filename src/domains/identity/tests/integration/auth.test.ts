import {
  AuthBeginResponse,
  AuthCompleteResponse,
} from '@/domains/identity/models';
import {
  createClientBasicAuthToken,
  createTestSiweMessage,
  requestAccessToken,
} from '@/domains/identity/tests/helpers/auth-helpers';
import { setupApp } from '@/global/app';
import { Problem, ValidationProblem } from '@/shared/types';
import { PrismaClient } from '@prisma/client';
import { Wallet } from 'ethers';
import { Express } from 'express';
import request from 'supertest';

describe('authentication', () => {
  let app: Express;
  let prisma: PrismaClient;

  beforeAll(async () => {
    app = await setupApp();
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('/auth/begin should return 200', async () => {
    // arrange
    const { address: publicAddress } = Wallet.createRandom();

    // act
    const response = await request(app)
      .post('/auth/begin')
      .set('Authorization', createClientBasicAuthToken())
      .send({ publicAddress })
      .expect(200);

    const { body, headers } = response;
    const cookieString = headers['Set-Cookie'];
    const responseData = body as AuthBeginResponse;

    // assert
    expect(responseData).toBeDefined();
    expect(responseData.nonce).toBeDefined();
    expect(responseData.publicAddress).toBe(publicAddress);
    expect(cookieString).toBeDefined();
  });

  it('/auth/begin should return 400 on invalid publicAddress', async () => {
    // arrange
    const publicAddress = 'invalid';

    // act
    const response = await request(app)
      .post('/auth/begin')
      .set('Authorization', createClientBasicAuthToken())
      .send({ publicAddress })
      .expect(400)
      .then((res) => res.body as ValidationProblem);

    // assert
    expect(response).toBeDefined();
    expect(response.status).toBe(400);
    expect(response.errors).toHaveLength(1);
    expect(
      response.errors?.every(
        (e) =>
          e.name === 'publicAddress' && e.reason === 'Invalid public address',
      ),
    ).toBeTruthy();
  });

  it('/auth/begin should return 400 on invalid payload', async () => {
    // arrange
    const publicAddress = null;

    // act
    const response = await request(app)
      .post('/auth/begin')
      .set('Authorization', createClientBasicAuthToken())
      .send({ publicAddress })
      .expect(400)
      .then((res) => res.body as ValidationProblem);

    // assert
    expect(response).toBeDefined();
    expect(response.status).toBe(400);
    expect(response.errors).toHaveLength(1);
    expect(
      response.errors?.every(
        (e) =>
          e.name === '/body/publicAddress' && e.reason === 'must be string',
      ),
    ).toBeTruthy();
  });

  it('/auth/begin should return 401 on missing client credentials', async () => {
    // arrange
    const publicAddress = '';

    // act
    const response = await request(app)
      .post('/auth/begin')
      .send({ publicAddress })
      .expect(401)
      .then((res) => res.body as Problem);

    // assert
    expect(response).toBeDefined();
    expect(response.detail).toBe('Authorization header is missing');
  });

  it('/auth/begin should return 401 on invalid client auth scheme', async () => {
    // arrange
    const publicAddress = '';

    // act
    const response = await request(app)
      .post('/auth/begin')
      .set('Authorization', 'Bearer boop:boop')
      .send({ publicAddress })
      .expect(401)
      .then((res) => res.body as Problem);

    // assert
    expect(response).toBeDefined();
    expect(response.detail).toBe('Invalid authorization scheme');
  });

  it('/auth/begin should return 401 on invalid client credentials', async () => {
    // arrange
    const publicAddress = '';

    // act
    const response = await request(app)
      .post('/auth/begin')
      .set('Authorization', 'Basic boop:boop')
      .send({ publicAddress })
      .expect(401)
      .then((res) => res.body as Problem);

    // assert
    expect(response).toBeDefined();
    expect(response.detail).toBe('Invalid client credentials');
  });

  it('/auth/complete should return 200', async () => {
    // arrange
    const wallet = Wallet.createRandom();
    const publicAddress = wallet.address;
    const authBeginResponse = await request(app)
      .post('/auth/begin')
      .set('Authorization', createClientBasicAuthToken())
      .send({ publicAddress })
      .expect(200);

    const { nonce } = authBeginResponse.body;
    const cookie = authBeginResponse.headers['Set-Cookie'];
    const { message, signature } = await createTestSiweMessage(wallet, nonce);
    authBeginResponse.headers;
    // act
    const authCompleteResponse = await request(app)
      .post('/auth/complete')
      .set('Authorization', createClientBasicAuthToken())
      .set('Cookie', cookie)
      .send({ publicAddress, message, signature })
      .expect(200);

    const authCompleteResponseData =
      authCompleteResponse.body as AuthCompleteResponse;

    // assert
    expect(authCompleteResponse.headers['Set-Cookie']).toBeUndefined(); // cookie should be cleared
    expect(authCompleteResponseData).toBeDefined();
    expect(authCompleteResponseData.accessToken).toBeDefined();
    expect(authCompleteResponseData.refreshToken).toBeDefined();

    const user = await prisma.user.findUnique({ where: { publicAddress } });
    expect(user).not.toBeNull();

    if (user) {
      expect(user.publicAddress).toBe(publicAddress);
      expect(user.isAdmin).toBeFalsy();
      expect(user.lastVerifiedAt).not.toBeNull();

      const refreshToken = await prisma.refreshToken.findUnique({
        where: { token: authCompleteResponseData.refreshToken },
      });

      expect(refreshToken).not.toBeNull();

      if (refreshToken) {
        expect(refreshToken.userId).toBe(user.id);
        expect(refreshToken.expiresAt).not.toBeNull();
      }
    }
  });

  it('/auth/begin should return 400 on invalid public address', async () => {
    // arrange
    const publicAddress = 'invalid';

    // act
    const response = await request(app)
      .post('/auth/complete')
      .set('Authorization', createClientBasicAuthToken())
      .send({ publicAddress, message: '', signature: '' })
      .expect(400)
      .then((res) => res.body as ValidationProblem);

    // assert
    expect(response).toBeDefined();
    expect(response.status).toBe(400);
    expect(response.errors).toHaveLength(1);
    expect(
      response.errors?.every(
        (e) =>
          e.name === 'publicAddress' && e.reason === 'Invalid public address',
      ),
    ).toBeTruthy();
  });

  it('/auth/begin should return 400 on invalid signature', async () => {
    // arrange
    const wallet = Wallet.createRandom();
    const publicAddress = wallet.address;
    const message = 'test';
    const signature = 'not byte like';

    // act
    const response = await request(app)
      .post('/auth/complete')
      .set('Authorization', createClientBasicAuthToken())
      .send({ publicAddress, message, signature })
      .expect(400)
      .then((res) => res.body as ValidationProblem);

    // assert
    expect(response).toBeDefined();
    expect(response.status).toBe(400);
    expect(response.errors).toHaveLength(1);
    expect(
      response.errors?.every(
        (e) => e.name === 'signature' && e.reason === 'Invalid signature',
      ),
    ).toBeTruthy();
  });

  it('/auth/complete should return 401 on invalid message', async () => {
    // arrange
    const wallet = Wallet.createRandom();
    const publicAddress = wallet.address;
    const authBeginResponse = await request(app)
      .post('/auth/begin')
      .set('Authorization', createClientBasicAuthToken())
      .send({ publicAddress })
      .expect(200);

    const { nonce } = authBeginResponse.body;
    const cookie = authBeginResponse.headers['Set-Cookie'];
    const { signature } = await createTestSiweMessage(wallet, nonce);

    // act
    const problem = await request(app)
      .post('/auth/complete')
      .set('Authorization', createClientBasicAuthToken())
      .set('Cookie', cookie)
      .send({ publicAddress, message: 'invalid message', signature })
      .expect(401)
      .then((res) => res.body as ValidationProblem);

    expect(problem).toBeDefined();
  });

  it('/auth/complete should return 401 on wrong signature', async () => {
    // arrange
    const wallet = Wallet.createRandom();
    const publicAddress = wallet.address;
    const authBeginResponse = await request(app)
      .post('/auth/begin')
      .set('Authorization', createClientBasicAuthToken())
      .send({ publicAddress })
      .expect(200);

    const { nonce } = authBeginResponse.body;
    const cookie = authBeginResponse.headers['Set-Cookie'];
    const { message } = await createTestSiweMessage(wallet, nonce);
    const signature = await wallet.signMessage('totally different message');

    // act
    const problem = await request(app)
      .post('/auth/complete')
      .set('Authorization', createClientBasicAuthToken())
      .set('Cookie', cookie)
      .send({ publicAddress, message, signature })
      .expect(401)
      .then((res) => res.body as ValidationProblem);

    expect(problem).toBeDefined();
  });

  it('/auth/complete should return 401 on missing nonce', async () => {
    // arrange
    const wallet = Wallet.createRandom();
    const publicAddress = wallet.address;
    const authBeginResponse = await request(app)
      .post('/auth/begin')
      .set('Authorization', createClientBasicAuthToken())
      .send({ publicAddress })
      .expect(200);

    const { nonce } = authBeginResponse.body;
    const { message, signature } = await createTestSiweMessage(wallet, nonce);

    // act
    const problem = await request(app)
      .post('/auth/complete')
      .set('Authorization', createClientBasicAuthToken())
      .send({ publicAddress, message, signature })
      .expect(401)
      .then((res) => res.body as ValidationProblem);

    expect(problem).toBeDefined();
  });

  it('/auth/refresh should return 200', async () => {
    // arrange
    const wallet = Wallet.createRandom();
    const { refreshToken } = await requestAccessToken(app, wallet);

    // act
    const authRefreshResponseData = await request(app)
      .post('/auth/refresh')
      .set('Authorization', createClientBasicAuthToken())
      .send({ refreshToken })
      .expect(200)
      .then((res) => res.body as AuthCompleteResponse);

    // assert
    const newRefreshToken = await prisma.refreshToken.findUnique({
      where: { token: authRefreshResponseData.refreshToken },
      include: { user: true },
    });

    expect(newRefreshToken).not.toBeNull();

    if (newRefreshToken) {
      expect(newRefreshToken.user.publicAddress).toBe(wallet.address);
      expect(newRefreshToken.expiresAt).not.toBeNull();
    }
  });

  it('/auth/refresh should return 401 on missing refresh token', async () => {
    // arrange
    const refreshToken = 'invalid';

    // act
    const res = await request(app)
      .post('/auth/refresh')
      .set('Authorization', createClientBasicAuthToken())
      .send({ refreshToken })
      .expect(401)
      .then((res) => res.body as Problem);

    // assert
    expect(res.status).toBe(401);
  });
});
