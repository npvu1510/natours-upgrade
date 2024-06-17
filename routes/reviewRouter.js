import express from 'express';

import {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  setBodyMiddleware,
  bookedCheckMiddleware,
} from '../controllers/reviewController.js';

import protectedApiRoute from '../middlewares/protectedApiRoute.js';
import restrictTo from '../middlewares/restrictTo.js';

const router = express.Router({ mergeParams: true });

router.use(protectedApiRoute);
router.use(setBodyMiddleware);

router
  .route('/')
  .get(getReviews)
  // restrictTo(['user']),
  .post(bookedCheckMiddleware, createReview);
router
  .route('/:id')
  .get(getReview)
  .patch(restrictTo(['user', 'admin']), updateReview)
  .delete(restrictTo(['user', 'admin']), deleteReview);

export default router;
