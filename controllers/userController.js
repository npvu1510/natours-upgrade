import path from 'path';
import multer from 'multer';
import sharp from 'sharp';

import User from '../models/userModel.js';

import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import signToken from '../utils/signToken.js';

import { deleteOne, getAll, getOne, updateOne } from './handleFactory.js';

// PROFILE HANDLERS
export const getProfileMiddleware = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};
export const updatePasswordProfile = catchAsync(async (req, res, next) => {
  const { currentPassword, password, confirmPassword } = req.body;

  if (!currentPassword)
    return next(new AppError(400, 'Please provide your current password'));

  const user = await User.findById(req.user._id).select('password');

  if (!(await user.isPasswordCorrect(currentPassword)))
    return next(new AppError(401, 'Current password is incorrect'));

  user.password = password;
  user.confirmPassword = confirmPassword;
  await user.save();

  const token = await signToken({ _id: user._id }, res);

  return res.status(200).json({ status: 'success', token });
});

export const updateProfile = catchAsync(async (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;

  if (password || confirmPassword)
    return next(new AppError(400, `This route can't update password`));

  const user = await User.findOne({ _id: req.user._id });

  user.name = name || user.name;
  user.email = email || user.email;

  if (req?.file?.filename) user.photo = req.file.filename;

  const updatedUser = await user.save();

  return res.status(200).json({ status: 'success', user: updatedUser });
});

export const disableAccount = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  return res.status(204).json({ status: 'success' });
});

// ADMIN HANDLERS
export const getUsers = getAll(User);
export const getUser = getOne(User);
// This handler not safe (findAndUpdate doesn't run middlewares)
export const updateUser = updateOne(User);
export const deleteUser = deleteOne(User);

// UPLOAD
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'public/img/users');
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
//     cb(null, file.fieldname + '-' + uniqueSuffix + '.jpg');
//   },
// });

const storage = multer.memoryStorage();

const fileFilter = (req, file, callback) => {
  const ext = path.extname(file.originalname);

  if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
    return callback(new Error('Only images are allowed'));
  }
  callback(null, true);
};

export const processImageMiddleware = (req, res, next) => {
  if (!req.file) return next();

  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  const fileName = req.file.fieldname + '-' + uniqueSuffix + '.jpeg';

  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${fileName}`);

  req.file.filename = fileName;

  next();
};

export const uploadAvatarUser = multer({ storage, fileFilter });
