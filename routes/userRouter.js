import express from 'express';

import bookingRouter from './bookingRouter.js';

import {
  updatePasswordProfile,
  updateProfile,
  disableAccount,

  // admin
  deleteUser,
  updateUser,
  getUsers,
  getUser,
  getProfileMiddleware,
  processImageMiddleware,
  uploadAvatarUser,
} from '../controllers/userController.js';

import protectedApiRoute from '../middlewares/protectedApiRoute.js';
import restrictTo from '../middlewares/restrictTo.js';

const router = express.Router();

// nested router
router.use('/:user/bookings', bookingRouter);

// profile routes
router.use(protectedApiRoute);

router.route('/get-profile').get(getProfileMiddleware, getUser);
router.route('/update-profile-password').patch(updatePasswordProfile);
router
  .route('/update-profile')
  .patch(
    uploadAvatarUser.single('photo'),
    processImageMiddleware,
    updateProfile,
  );
router.route('/disable-account').delete(disableAccount);

// admin routes
router.use(restrictTo(['admin']));

router.route('/').get(getUsers);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

export default router;
