import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

import AppError from '../utils/AppError.js';
import createRandomString from '../utils/createRandomString.js';
import createHashedString from '../utils/createHashedString.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide us your name'],
    },

    email: {
      type: String,
      required: [true, 'Please provide us your email address'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email address'],
    },

    googleId: {
      type: String,
    },

    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minLength: [3, 'Password must be at least 3 characters'],
      select: false,
    },

    confirmPassword: {
      type: String,
      required: [true, 'Please confirm your password'],
      select: false,

      validate: {
        validator: function (value) {
          return value === this.password;
        },
        message: 'Passwords are not the same',
      },
    },

    role: {
      type: String,
      enum: ['user', 'guide', 'lead-guide', 'admin'],
      default: 'user',
    },

    photo: String,

    lastPasswordChanged: {
      type: Date,
      default: Date.now() - 1000,
    },

    resetPasswordToken: String,
    resetPasswordTokenExpireAt: Date,

    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  { timestamp: true },
);

// DOCUMENT MIDDLEWARES
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    // console.log('PASSWORD IS NOT MODIFIED');

    return next();
  }

  // console.log('PASSWORD IS MODIFIED');
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = null;

  this.lastPasswordChanged = Date.now() - 1000;
  console.log(`PASSWORD CHANGED AT: ${this.lastPasswordChanged.getTime()}`);
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });

  next();
});

// METHODS
userSchema.methods.isPasswordCorrect = async function (inputPassword) {
  return await bcrypt.compare(inputPassword, this.password);
};

userSchema.methods.isPasswordChangedAfter = function (time) {
  return this.lastPasswordChanged.getTime() > time * 1000;
};

userSchema.methods.createResetToken = async function () {
  try {
    const resetTokenForSending = await createRandomString(32);
    const resetTokenForStoraging = createHashedString(resetTokenForSending);

    this.resetPasswordToken = resetTokenForStoraging;
    this.resetPasswordTokenExpireAt =
      Date.now() + process.env.RESET_PASSWORD_TOKEN_EXPIRE_AT * 1;

    return resetTokenForSending;
  } catch (err) {
    throw new AppError(500, err.message);
  }
};

userSchema.methods.removeResetToken = function () {
  this.resetPasswordToken = null;
  this.resetPasswordTokenExpireAt = null;
};

const User = mongoose.model('User', userSchema);

// const newUserByCreate = User.create({
//   name: 'admin',
//   email: 'admin@gmail.com',
//   password: 123,
//   confirmPassword: 123, // Ví dụ sai confirm password để kích hoạt validation
// });

// const newUserBySave = new User({
//   name: 'admin',
//   email: 'admin@gmail.com',
//   password: 123,
//   confirmPassword: 123, // Ví dụ sai confirm password để kích hoạt validation
// });
// newUserBySave.save();

// User.findOne({ _id: '663f00bdb21eab7656f6d02b' })
//   .then(async (user) => {
//     if (!user) process.exit(1);

//     console.log(user);

//     user.name = 'updated by save 99';
//     // user.password = 9;
//     // user.confirmPassword = '9999';

//     const updatedUser = await user.save({ validateBeforeSave: false });
//     console.log(updatedUser);
//   })
//   .catch((err) => console.log(err));

// User.findByIdAndUpdate(
//   '663edf65832d7e356614db5d',
//   {
//     name: 'updated by update',
//     password: 2,
//     confirmPassword: 123,
//   },
//   {
//     new: true,
//     runValidators: true,
//   },
// )
//   .then((user) => {
//     if (!user) process.exit(1);

//     console.log(user);
//   })
//   .catch((err) => {
//     console.log(err);
//   });

// User.find({ email: { $ne: '' } })
//   .then((users) => {
//     console.log(users);
//   })
//   .catch((err) => {
//     console.log(err);
//   });

export default User;
