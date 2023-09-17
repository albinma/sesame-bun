import { setupApp } from '@/global/app';
import { ValidationProblem } from '@/shared/types';
import { PrismaClient } from '@prisma/client';
import { Wallet } from 'ethers';
import { Express } from 'express';
import { SiweMessage } from 'siwe';
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

  it('/auth/begin should return nonce', async () => {
    // arrange
    const { address: publicAddress } = Wallet.createRandom();

    // act
    const response = await request(app)
      .post('/auth/begin')
      .send({ publicAddress })
      .expect(200);

    const { body, headers } = response;

    const cookieString = headers['Set-Cookie'];

    // assert
    expect(body).toBeDefined();
    expect(body.nonce).toBeDefined();
    expect(body.publicAddress).toBe(publicAddress);
    expect(cookieString).toBeDefined();

    // user should not be created at this point
    const user = await prisma.user.findUnique({ where: { publicAddress } });
    expect(user).toBeNull();
  });

  it('/auth/begin should return 400 on invalid publicAddress', async () => {
    // arrange
    const publicAddress = 'invalid';

    // act
    const response = await request(app)
      .post('/auth/begin')
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

  it('should authentication successfully', async () => {
    // arrange
    const wallet = Wallet.createRandom();
    const publicAddress = wallet.address;
    const domain = 'localhost';
    const origin = `http://${domain}:8080`;
    const statement = 'This is a test';

    // act
    const authBeginResponse = await request(app)
      .post('/auth/begin')
      .send({ publicAddress })
      .expect(200);

    const { nonce } = authBeginResponse.body;
    const cookie = authBeginResponse.headers['Set-Cookie'];
    const siweMessage = new SiweMessage({
      domain,
      address: publicAddress,
      statement,
      uri: origin,
      version: '1',
      chainId: 1,
      nonce,
    });

    const message = siweMessage.prepareMessage();
    const signature = await wallet.signMessage(message);

    const authCompleteResponse = await request(app)
      .post('/auth/complete')
      .withCredentials(true)
      .set('Cookie', cookie)
      .send({ publicAddress, message, signature })
      .expect(200);

    const { body: authCompleteResponseData } = authCompleteResponse;

    // assert
    expect(authCompleteResponseData).toBeDefined();
    expect(authCompleteResponse.headers['Set-Cookie']).toBeUndefined(); // cookie should be cleared
    expect(authCompleteResponseData.accessToken).toBeDefined();
    expect(authCompleteResponseData.refreshToken).toBeDefined();

    const user = await prisma.user.findUnique({ where: { publicAddress } });
    expect(user).not.toBeNull();

    if (user) {
      expect(user.publicAddress).toBe(publicAddress);
      expect(user.nonce).toBe(nonce);
      expect(user.isAdmin).toBeFalsy();
      expect(user.lastVerifiedAt).not.toBeNull();
    }
  });
});
