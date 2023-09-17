import {
  AuthBeginRequest,
  AuthBeginResponse,
  AuthCompleteRequest,
  AuthCompleteResponse,
  AuthRefreshRequest,
} from '@/domains/identity/models';
import { UnauthorizedError, ValidationError } from '@/shared/errors';
import { prisma } from '@/shared/initializers/database';
import { getAddress, isAddress } from 'ethers';
import { Request, Response } from 'express';
import { SiweMessage, generateNonce } from 'siwe';

export async function beginAuthentication(
  req: Request<AuthBeginRequest>,
  res: Response<AuthBeginResponse>,
): Promise<void> {
  const { publicAddress: requestPublicAddress } = req.body;

  if (!isAddress(requestPublicAddress)) {
    throw new ValidationError('publicAddress', 'Invalid public address');
  }

  const publicAddress = getAddress(requestPublicAddress);
  const nonce = generateNonce();

  req.session.nonce = nonce;

  res.send({
    publicAddress,
    nonce,
  });
}

export async function completeAuthentication(
  req: Request<AuthCompleteRequest>,
  res: Response<AuthCompleteResponse>,
): Promise<void> {
  try {
    const {
      publicAddress: requestPublicAddress,
      message,
      signature,
    } = req.body;

    if (!isAddress(requestPublicAddress)) {
      throw new ValidationError('publicAddress', 'Invalid public address');
    }

    const publicAddress = getAddress(requestPublicAddress);
    const { nonce } = req.session;

    if (!nonce) {
      throw new Error("Nonce doesn't exist in session");
    }

    const siwe = new SiweMessage(message);
    const { data } = await siwe.verify({ signature, nonce });

    if (!data) {
      throw new Error('Invalid signature');
    }

    if (data.expirationTime) {
      req.session.cookie.expires = new Date(data.expirationTime);
    }
    const lastVerifiedAt = new Date();
    const user = await prisma.user.upsert({
      create: {
        publicAddress,
        nonce,
        lastVerifiedAt,
      },
      update: {
        nonce,
        lastVerifiedAt,
      },
      where: {
        publicAddress,
      },
    });

    const accessToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c_' +
      user.publicAddress;
    const refreshToken =
      'b9fb87f2893d8fdcbf8f65f6c7069485d013808115fbb9159edd247de2551883';

    req.session.save(() =>
      res.send({
        accessToken,
        refreshToken,
      }),
    );
  } catch (err) {
    req.log.error(err, 'Error completing authentication');
    throw new UnauthorizedError();
  }
}

export async function refreshAuthentication(
  req: Request<AuthRefreshRequest>,
  res: Response<AuthCompleteResponse>,
): Promise<void> {
  const accessToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
  const refreshToken =
    'b9fb87f2893d8fdcbf8f65f6c7069485d013808115fbb9159edd247de2551883';
  res.send({
    accessToken,
    refreshToken,
  });
}
