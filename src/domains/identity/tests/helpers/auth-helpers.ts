import { AuthCompleteResponse } from '@/domains/identity/models';
import { HDNodeWallet } from 'ethers';
import { Express } from 'express';
import { SiweMessage } from 'siwe';
import request from 'supertest';

export async function createTestSiweMessage(
  wallet: HDNodeWallet,
  nonce: string,
): Promise<{
  siweMessage: SiweMessage;
  message: string;
  signature: string;
}> {
  const publicAddress = wallet.address;
  const domain = 'localhost';
  const origin = `http://${domain}:8080`;
  const statement = 'This is a test';
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

  return { siweMessage, message, signature };
}

export async function requestAccessToken(
  app: Express,
  wallet: HDNodeWallet,
): Promise<AuthCompleteResponse> {
  const publicAddress = wallet.address;
  const authBeginResponse = await request(app)
    .post('/auth/begin')
    .send({ publicAddress })
    .expect(200);

  const cookie = authBeginResponse.headers['Set-Cookie'];
  const { nonce } = authBeginResponse.body;
  const { message, signature } = await createTestSiweMessage(wallet, nonce);

  const { accessToken, refreshToken } = await request(app)
    .post('/auth/complete')
    .set('Cookie', cookie)
    .send({ publicAddress, message, signature })
    .expect(200)
    .then((res) => res.body as AuthCompleteResponse);

  return { accessToken, refreshToken };
}
