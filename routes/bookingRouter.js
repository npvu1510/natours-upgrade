import express from 'express';

import {
  getBookings,
  getBooking,
  createBooking,
  updateBooking,
  deleteBooking,
} from '../controllers/bookingController.js';

import protectedApiRoute from '../middlewares/protectedApiRoute.js';
import restrictTo from '../middlewares/restrictTo.js';
import { setBodyMiddleware } from '../controllers/bookingController.js';

const router = express.Router({ mergeParams: true });

router.use(protectedApiRoute);
// router.use(restrictTo('admin', 'lead-guide'));
router.use(setBodyMiddleware);

router.route('/').get(getBookings).post(createBooking);
router.route('/:id').get(getBooking).patch(updateBooking).delete(deleteBooking);

export default router;
