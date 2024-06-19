import jwt from 'jsonwebtoken';
//
import { promisify } from 'util';

import redisClient from '../config/redisClient.js';
// import AppError from './AppError.js';

const signToken = async (payload, res, isRefresh = false) => {
  const secretKey = !isRefresh
    ? process.env.JWT_SECRET_KEY
    : process.env.JWT_SECRET_KEY_FOR_REFRESH;

  const signAsync = promisify(jwt.sign);
  const token = await signAsync(payload, secretKey, {
    expiresIn: !isRefresh
      ? process.env.JWT_EXPIRES_IN
      : process.env.JWT_EXPIRES_IN_FOR_REFRESH,
  });

  const cookieOptions = {
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  if (isRefresh)
    await redisClient.set(payload._id.toString(), token, {
      EX: process.env.REDIS_REFRESH_TOKEN_EXPIRE, // Lưu refresh token vào Redis với thời hạn 7 ngày
    });

  res.cookie(!isRefresh ? 'jwt' : 'refreshToken', token, cookieOptions);
  return token;
};

export default signToken;

export const signAccessAndRefreshToken = async (userId, res) => {
  // Tạo jwt token
  const accessToken = await signToken({ _id: userId }, res);
  const refreshToken = await signToken({ _id: userId }, res, true);

  // const ttl = await redisClient.ttl(userId.toString(), refreshToken);
  // console.log(ttl);

  return { accessToken, refreshToken };
};
