import validator from 'validator';
import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import { google } from 'googleapis';

import User from '../models/userModel.js';

// Utils
import Email from '../utils/Email.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import signToken from '../utils/signToken.js';
import createHashedString from '../utils/createHashedString.js';
import { signAccessAndRefreshToken } from '../utils/signToken.js';
import verifyToken from '../utils/verifyToken.js';

// redis

export const register = catchAsync(async (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;

  const newUser = await User.create({ name, email, password, confirmPassword });

  const { accessToken, refreshToken } = await signAccessAndRefreshToken(
    newUser._id,
    res,
  );

  const updateProfileUrl = `${req.protocol}://${req.get('host')}/profile`;
  await new Email('', email).sendWelcomeEmail({ name, url: updateProfileUrl });

  res.status(200).json({ status: 'success', token: accessToken, refreshToken });
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Kiểm tra input
  if (!email || !password)
    return next(new AppError(400, 'Please provide us email and password'));

  // Kiểm tra email
  const user = await User.findOne({ email: email }).select('+password');
  if (!user)
    return next(new AppError(401, 'Email has not registered an account'));

  // Kiểm tra pasword

  if (!(await user.isPasswordCorrect(password)))
    return next(new AppError(401, 'Password is incorrect'));

  const { accessToken, refreshToken } = await signAccessAndRefreshToken(
    user._id,
    res,
  );

  res.status(200).json({ status: 'success', token: accessToken, refreshToken });
});

export const logout = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.cookies;

  const isValidToken = await verifyToken(refreshToken, true);
  if (!isValidToken) return next(new AppError(401, "You're not logged in"));

  res.clearCookie('jwt');
  res.clearCookie('refreshToken');

  res.status(200).json({ status: 'success' });
});

export const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email)
    return next(new AppError(400, 'Please provide your email address'));

  if (!validator.isEmail(email))
    return next(new AppError(400, 'Please provide a valid email address'));

  const user = await User.findOne({ email });
  if (!user) return next(new AppError(404, 'Account not exist'));

  // Bỏ trong try catch để có thể xử lý thêm, vì khi gặp lỗi ngoài gửi lỗi còn phải xóa đi token đã tạo
  try {
    const resetToken = await user.createResetToken();

    const resetPasswordUrl = `${req.protocol}://${req.get('host')}/reset-password?resetToken=${resetToken}`;
    await new Email('', email).sendResetPasswordEmail({
      name: user.name,
      url: resetPasswordUrl,
    });

    res.status(200).json({ status: 'success' });
  } catch (err) {
    user.removeResetToken();
    const resetTokenError = new AppError(500, err.message);
    resetTokenError.name = 'resetTokenError';
    next(resetTokenError);
  } finally {
    user.save();
  }
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const { resetToken } = req.query;
  if (!resetToken) return next(new AppError(400, 'Reset token not found'));

  const hashedResetToken = createHashedString(resetToken);
  const user = await User.findOne({
    resetPasswordToken: hashedResetToken,
    resetPasswordTokenExpireAt: { $gt: Date.now() },
  });

  if (!user)
    return next(new AppError(400, 'Reset token is invalid or expired'));

  const { password, confirmPassword } = req.body;
  user.password = password;
  user.confirmPassword = confirmPassword;

  user.removeResetToken();
  await user.save();

  return res.status(200).json({ status: 'success', data: { user } });
});

// google
const oauth2Client = new google.auth.OAuth2(
  process.env.AUTH_CLIENT_ID,
  process.env.AUTH_CLIENT_SECRET,
  process.env.AUTH_REDIRECT_URI,
);

export const loginWithGoogle = catchAsync(async (req, res, next) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['openid', 'profile', 'email'],
    response_type: 'code',
  });

  res.status(200).json({ status: 'success', url: authUrl });
});

export const loginWithGoogleCallback = catchAsync(async (req, res, next) => {
  const { code } = req.query;
  const data = await oauth2Client.getToken(code);
  // console.log(data);

  const { id_token } = data.tokens;

  // const payload = jwt.decode(id_token);
  // console.log(payload);
  const { name, email, sub } = jwt.decode(id_token);

  let user = await User.findOne({ email });
  if (!user) {
    user = new User({
      name,
      email,
      googleId: sub,
    });

    await user.save({ validateBeforeSave: false });

    const updateProfileUrl = `${req.protocol}://${req.get('host')}/profile`;
    await new Email('', email).sendWelcomeEmail({
      name,
      url: updateProfileUrl,
    });
  }

  await signAccessAndRefreshToken(user._id, res);

  return res.redirect('/');
});

export const refreshAccessToken = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) return next(new AppError(401, "You're not logged in"));

  const isValidToken = await verifyToken(refreshToken, true);
  if (!isValidToken) return next(new AppError(401, "You're not logged in"));

  const { _id: userId } = await promisify(jwt.verify)(
    refreshToken,
    process.env.JWT_SECRET_KEY_FOR_REFRESH,
  );

  const user = await User.findById(userId);
  if (!user) return next(new AppError(422, 'User no longer exists'));

  const accessToken = await signToken({ _id: user._id }, res);
  const newRefreshToken = await signToken({ _id: user._id }, res, true);

  return res.status(200).json({
    status: 'success',
    token: accessToken,
    refreshToken: newRefreshToken,
  });
});
