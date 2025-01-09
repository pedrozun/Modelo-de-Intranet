import crypto from 'crypto';

export function createHash(text) {
  return crypto.createHash('md5').update(text).digest('hex');
}
