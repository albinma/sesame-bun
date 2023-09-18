import { randomBytes } from 'crypto';

export function generate256BitSecret(): string {
  return randomBytes(32).toString('hex');
}
