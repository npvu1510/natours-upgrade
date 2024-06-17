import { promisify } from 'util';
import jwt from 'jsonwebtoken';

import User from '../models/userModel.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';

import verifyToken from '../utils/verifyToken.js';
import signToken from '../utils/signToken.js';

const protectedViewRoute = catchAsync(async (req, res, next) => {
  const token =
    (req.headers?.authorization?.startsWith('Bearer') &&
      req.headers?.authorization?.split(' ')[1]) ||
    req.cookies?.jwt;

  // Kiểm tra header
  if (!token) {
    res.locals.user = null;
    if (req.isRedirect) {
      return res.redirect('/login');
    }
    return next();
  }

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

      if (!refreshToken) {
        res.locals.user = null;
        if (req.isRedirect) {
          return res.redirect('/login');
        }
        return next();
      }

      const isValidToken = await verifyToken(refreshToken, true);
      if (!isValidToken) {
        res.locals.user = null;
        if (req.isRedirect) {
          return res.redirect('/login');
        }
        return next();
      }

      // Cấp token mới
      payload = jwt.decode(refreshToken);
      await signToken({ _id: payload._id }, res, false);
    } else {
      res.locals.user = null;
      if (req.isRedirect) {
        return res.redirect('/login');
      }
      return next();
    }
  }

  // Xử lý payload sau khi decode hoặc verify
  if (payload) {
    _id = payload._id;
    email = payload.email;
    iat = payload.iat;
  }

  // Kiểm tra user với token đó còn tồn tại không ?
  const user = await User.findOne({ $or: [{ _id }, { email }] });
  if (!user) {
    res.locals.user = null;
    if (req.isRedirect) {
      return res.redirect('/login');
    }
    return next();
  }

  // Kiểm tra user đã đổi mật khẩu sau khi token được cấp chưa ?
  if (user.isPasswordChangedAfter(iat)) {
    res.locals.user = null;
    if (req.isRedirect) {
      return res.redirect('/login');
    }
    return next();
  }

  req.user = user;
  res.locals.user = user;

  return next();
});

export default protectedViewRoute;
