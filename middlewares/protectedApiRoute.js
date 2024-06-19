import { promisify } from 'util';
import jwt from 'jsonwebtoken';

import User from '../models/userModel.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';

import verifyToken from '../utils/verifyToken.js';
import signToken from '../utils/signToken.js';

const protectedApiRoute = catchAsync(async (req, res, next) => {
  const token =
    (req.headers?.authorization?.startsWith('Bearer') &&
      req.headers?.authorization?.split(' ')[1]) ||
    req.cookies?.jwt;

  // Kiểm tra header
  if (!token) return next(new AppError(401, 'You are not login !'));

  // Kiểm tra token
  let _id, email, iat;

  // Verify và refresh token (nếu cần)
  let payload;
  try {
    const asyncVerify = promisify(jwt.verify);
    payload = await asyncVerify(token, process.env.JWT_SECRET_KEY);
  } catch (err) {
    // Refresh access token
    if (err.name === 'TokenExpiredError') {
      const { refreshToken } = req.cookies;

      if (!refreshToken) return next(new AppError(401, 'You are not login !'));

      const isValidToken = await verifyToken(refreshToken, true);
      if (!isValidToken) return next(new AppError(401, 'You are not login !'));

      // Cấp token mới
      payload = jwt.decode(refreshToken);
      const newToken = await signToken({ _id: payload._id }, res, false);
      console.log(`new token: ${req.cookies.jwt}`);
      console.log(payload);
    } else if (err.name === 'JsonWebTokenError')
      return next(new AppError(401, 'You are not login!'));
    else return next(err);
  } finally {
    if (payload) {
      _id = payload._id;
      email = payload.email;
      iat = payload.iat;
    }
  }
  // console.log(payload);
  // _id = payload._id;
  // email = payload.email;
  // iat = payload.iat;

  // Kiểm tra user với token đó còn tồn tại không ?
  const user = await User.findOne({ $or: [{ _id }, { email }] });
  console.log(user);

  if (!user)
    return next(
      new AppError(401, 'User is no longer available. Please login again !'),
    );

  //  Kiểm tra user đã đổi mật khẩu sau khi token được cấp chưa ?
  if (user.isPasswordChangedAfter(iat))
    return next(
      new AppError(
        400,
        'User has already changed password. Please log in again !',
      ),
    );

  req.user = user;
  res.locals.user = user;

  return next();
});

export default protectedApiRoute;
