import { AuthBeginResponse } from '@/domains/identity/models';
import { setupApp } from '@/global/app';
import { ValidationProblem } from '@/shared/types';
import { PrismaClient } from '@prisma/client';
import { Wallet } from 'ethers';
import { Express } from 'express';
import request from 'supertest';

describe('/auth', () => {
  let app: Express;
  let prisma: PrismaClient;

  beforeAll(async () => {
    app = await setupApp();
    prisma = new PrismaClient();
  });

  it('/auth/begin should return nonce', async () => {
    // arrange
    const { address: publicAddress } = Wallet.createRandom();

    // act
    const response = await request(app)
      .post('/auth/begin')
      .send({ publicAddress })
      .expect(200)
      .then((res) => res.body as AuthBeginResponse);

    // assert
    expect(response).toBeDefined();
    expect(response.nonce).toBeDefined();
    expect(response.publicAddress).toBe(publicAddress);

    const user = await prisma.user.findUnique({ where: { publicAddress } });
    expect(user).not.toBeNull();

    if (user) {
      expect(user.publicAddress).toBe(publicAddress);
      expect(user.nonce).toBe(response.nonce);
      expect(user.isAdmin).toBeFalsy();
      expect(user.lastVerifiedAt).toBeNull();
    }
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

    const user = await prisma.user.findUnique({ where: { publicAddress } });
    expect(user).toBeNull();
  });
});
