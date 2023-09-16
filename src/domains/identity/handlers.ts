import {
  AuthBeginRequest,
  AuthBeginResponse,
  AuthCompleteRequest,
  AuthCompleteResponse,
  AuthRefreshRequest,
} from '@/domains/identity/models';
import { prisma } from '@/shared/initializers/database';
import { isAddress } from 'ethers';
import { Request, Response } from 'express';
import createHttpError from 'http-errors';
import { generateNonce } from 'siwe';

export async function beginAuthentication(
  req: Request<AuthBeginRequest>,
  res: Response<AuthBeginResponse>,
): Promise<void> {
  const { publicAddress } = req.body;

  if (!isAddress(publicAddress)) {
    throw new createHttpError.BadRequest('Invalid public address');
  }

  let user = await prisma.user.findUnique({ where: { publicAddress } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        publicAddress,
        nonce: generateNonce(),
      },
    });
  }

  const { nonce } = user;

  res.send({
    publicAddress,
    nonce,
  });
}

export async function completeAuthentication(
  req: Request<AuthCompleteRequest>,
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
