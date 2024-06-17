import express from 'express';

import reviewRouter from './reviewRouter.js';
import bookingRouter from './bookingRouter.js';

import {
  // checkTourId,
  getTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  get5BestCheapTours,
  getTourStats,
  getMonthlyPlan,
  uploadTourImages,
  processTourImages,
} from '../controllers/tourController.js';

import protectedApiRoute from '../middlewares/protectedApiRoute.js';
import restrictTo from '../middlewares/restrictTo.js';

const router = express.Router();

// router.param('tourId', checkTourId);

// review
router.use('/:tour/reviews', reviewRouter);
router.use('/:tour/bookings', bookingRouter);

router.get(
  '/top-5-best-cheap-tours',
  protectedApiRoute,
  restrictTo(['admin']),
  get5BestCheapTours,
  getTours,
);

router.get(
  '/tour-stats',
  protectedApiRoute,
  restrictTo(['admin']),
  getTourStats,
);
router.get(
  '/monthly-plan',
  protectedApiRoute,
  restrictTo(['admin']),
  getMonthlyPlan,
);

router
  .route('/')
  .get(protectedApiRoute, restrictTo(['admin']), getTours)
  .post(protectedApiRoute, restrictTo(['admin']), createTour);

router
  .route('/:id')
  .get(getTour)
  .patch(
    protectedApiRoute,
    restrictTo(['admin']),
    uploadTourImages.fields([
      { name: 'imageCover', maxCount: 1 },
      { name: 'images', maxCount: 3 },
    ]),
    processTourImages,
    updateTour,
  )
  .delete(
    protectedApiRoute,
    restrictTo(['admin']),
    protectedApiRoute,
    deleteTour,
  );

export default router;
