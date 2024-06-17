import express from 'express';

import {
  login,
  logout,
  register,
  forgotPassword,
  resetPassword,
  loginWithGoogle,
  loginWithGoogleCallback,
  refreshAccessToken,
} from '../controllers/authController.js';

const router = express.Router();

// local
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/register').post(register);

// google
router.route('/google').get(loginWithGoogle);
router.route('/google/callback').get(loginWithGoogleCallback);

// forgot password
router.route('/forgot-password').post(forgotPassword);
router.route('/reset-password').post(resetPassword);

// refresh token
router.route('/refresh').get(refreshAccessToken);

export default router;
