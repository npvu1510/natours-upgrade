import Booking from '../models/bookingModel.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';

import {
  getAll,
  createOne,
  getOne,
  updateOne,
  deleteOne,
} from './handleFactory.js';

export const setBodyMiddleware = (req, res, next) => {
  req.body.tour = req.body.tour || req.params.tour;
  req.body.user = req.body.user || req.params.user || req.user._id;

  next();
};

export const bookedCheckMiddleware = catchAsync(async (req, res, next) => {
  const { user, tour } = req.body;

  const bookingsByUser = await Booking.find({ user, tour });
  if (!bookingsByUser || bookingsByUser.length === 0)
    return next(new AppError(403, 'You must book the tour before reviewing.'));

  next();
});

export const getBookings = getAll(Booking, 'tour');
export const getBooking = getOne(Booking);
export const createBooking = createOne(Booking);
export const updateBooking = updateOne(Booking);
export const deleteBooking = deleteOne(Booking);
