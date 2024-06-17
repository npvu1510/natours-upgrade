import crypto from 'crypto';

const createHashedString = (resetToken) =>
  crypto.createHash('sha256').update(resetToken).digest('hex');
export default createHashedString;
