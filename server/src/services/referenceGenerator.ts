import { randomInt } from 'crypto';

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateReference(): string {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += CHARS[randomInt(CHARS.length)];
  }
  return `LN-${code}`;
}
