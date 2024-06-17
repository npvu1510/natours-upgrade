import Booking from '../models/bookingModel.js';
import Review from '../models/reviewModel.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';

import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from './handleFactory.js';

// prepare body data middleware
export const setBodyMiddleware = (req, res, next) => {
  // console.log(req.params);
  req.body.user = req.body.user || req.user._id;
  req.body.tour = req.body.tour || req.params.tour;

  next();
};

export const bookedCheckMiddleware = catchAsync(async (req, res, next) => {
  const { user, tour } = req.body;

  const bookingsByUser = await Booking.find({ user, tour });

  if (!bookingsByUser || bookingsByUser.length === 0)
    return next(new AppError(403, 'You must book the tour before reviewing.'));

  next();
});

export const getReviews = getAll(Review, 'tour');
export const getReview = getOne(Review);
export const createReview = createOne(Review);
export const updateReview = updateOne(Review);
export const deleteReview = deleteOne(Review);
