import { AuthBeginRequest, AuthBeginResponse } from '@/domains/identity/models';
import { Request, Response } from 'express';

export async function beginAuthentication(
  req: Request<AuthBeginRequest>,
  res: Response<AuthBeginResponse>,
): Promise<void> {
  const { publicAddress } = req.body;

  res.send({
    publicAddress,
    nonce: '0x1234567890abcdef',
  });
}
