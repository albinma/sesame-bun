/* eslint-disable no-console */

import { SiweMessage } from 'siwe';

const message = '';
const siwe = new SiweMessage(message);
const res = await siwe.verify({ signature: '', nonce: '' });

console.log(res);
