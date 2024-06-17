import crypto from 'crypto';
import { promisify } from 'util';

const createRandomString = async (numBytes) => {
  const asyncRandomBytes = promisify(crypto.randomBytes);
  return (await asyncRandomBytes(numBytes)).toString('hex');
};

export default createRandomString;
