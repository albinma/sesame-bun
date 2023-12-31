import {
  AuthBeginRequest,
  AuthBeginResponse,
  AuthCompleteRequest,
  AuthCompleteResponse,
  AuthRefreshRequest,
} from '@/domains/identity/models';
import { APP_CONFIGURATION } from '@/shared/configs';
import { UnauthorizedError, ValidationError } from '@/shared/errors';
import { prisma } from '@/shared/initializers/database';
import { TypedRequest } from '@/shared/types';
import { generate256BitSecret } from '@/utils/crypto-utils';
import { User } from '@prisma/client';
import { getAddress, isAddress, isBytesLike } from 'ethers';
import { Response } from 'express';
import { SignJWT } from 'jose';
import { DateTime } from 'luxon';
import { SiweMessage, generateNonce } from 'siwe';

export async function beginAuthentication(
  req: TypedRequest<AuthBeginRequest>,
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
  req: TypedRequest<AuthCompleteRequest>,
  res: Response<AuthCompleteResponse>,
): Promise<void> {
  const { publicAddress: requestPublicAddress, message, signature } = req.body;

  if (!isAddress(requestPublicAddress)) {
    throw new ValidationError('publicAddress', 'Invalid public address');
  }

  if (!isBytesLike(signature)) {
    throw new ValidationError('signature', 'Invalid signature');
  }

  try {
    const publicAddress = getAddress(requestPublicAddress);
    const { nonce } = req.session;

    if (!nonce) {
      throw new Error("Nonce doesn't exist in session");
    }

    const siwe = new SiweMessage(message);

    // no need to capture response, throws error if message invalid
    await siwe.verify({ signature, nonce });

    const lastVerifiedAt = new Date();
    const user = await prisma.user.upsert({
      create: {
        publicAddress,
        lastVerifiedAt,
      },
      update: {
        lastVerifiedAt,
      },
      where: {
        publicAddress,
      },
    });

    const accessToken = await createAccessToken(user);
    const refreshToken = await grantRefreshToken(user);

    // Destroy the session because it's no longer needed
    req.session.destroy(() =>
      res.send({
        accessToken,
        refreshToken,
      }),
    );
  } catch (err) {
    req.log.warn(err, 'Error completing authentication');
    req.session.destroy(() => {});
    throw new UnauthorizedError();
  }
}

export async function refreshAuthentication(
  req: TypedRequest<AuthRefreshRequest>,
  res: Response<AuthCompleteResponse>,
): Promise<void> {
  try {
    const { refreshToken: token } = req.body;
    const refreshToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!refreshToken) {
      throw new Error('Cannot find existing refresh token');
    }

    const { user } = refreshToken;
    const accessToken = await createAccessToken(user);
    const newToken = await grantRefreshToken(user);

    res.send({
      accessToken,
      refreshToken: newToken,
    });
  } catch (err) {
    req.log.warn(err, 'Error refreshing authentication');
    throw new UnauthorizedError();
  }
}

async function createAccessToken(user: User): Promise<string> {
  const {
    secret,
    algorithm: alg,
    audience,
    issuer,
    expiresIn,
  } = APP_CONFIGURATION.jwt;

  const { publicAddress, isAdmin } = user;

  const accessToken = await new SignJWT({ isAdmin })
    .setProtectedHeader({ alg, typ: 'JWT' })
    .setSubject(publicAddress)
    .setIssuedAt()
    .setIssuer(issuer)
    .setAudience(audience)
    .setExpirationTime(expiresIn)
    .sign(new TextEncoder().encode(secret));

  return accessToken;
}

async function grantRefreshToken(user: User): Promise<string> {
  const { refreshTokenExpiresInSeconds } = APP_CONFIGURATION.jwt;
  const refreshToken = generate256BitSecret();
  await prisma.refreshToken.upsert({
    create: {
      token: refreshToken,
      userId: user.id,
      expiresAt: DateTime.utc()
        .plus({ seconds: refreshTokenExpiresInSeconds })
        .toJSDate(),
    },
    update: {
      token: refreshToken,
      expiresAt: DateTime.utc()
        .plus({ seconds: refreshTokenExpiresInSeconds })
        .toJSDate(),
    },
    where: {
      userId: user.id,
    },
  });

  return refreshToken;
}
