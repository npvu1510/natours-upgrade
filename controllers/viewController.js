import Tour from '../models/tourModel.js';
import User from '../models/userModel.js';
import Booking from '../models/bookingModel.js';

import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import createHashedString from '../utils/createHashedString.js';
import Review from '../models/reviewModel.js';

export const getBase = (req, res, next) => {
  res.status(200).render('base', {
    title: 'Base',
  });
};

export const getOverviewPage = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();

  res.status(200).render('overview', {
    title: 'Overview',
    tours,
  });
});

export const getSignupPage = (req, res) => {
  res.status(200).render('signup', {
    title: 'Signup an account',
  });
};

export const getLoginPage = (req, res) => {
  res.status(200).render('login', {
    title: 'Login your account',
  });
};

export const getProfilePage = (req, res) => {
  if (!req.user) return res.redirect('/login');

  res.status(200).render('profile', {
    title: 'My profile',
  });
};

export const getTourPage = catchAsync(async (req, res, next) => {
  const { slug } = req.params;
  const userId = req.user._id;

  // Tour đang cần xem
  const tour = await Tour.findOne({ slug }).populate({
    path: 'reviews',
  });
  if (!tour) return next(new AppError(404, 'Tour not found'));

  const currentTourBookings = await Booking.find({
    tour: tour._id,
    user: userId,
  });

  // Các tour đã book
  const currentTourBookedDates = currentTourBookings.map((booking) =>
    booking.startDate.getTime(),
  );

  // Review
  const myReview = await Review.findOne({ user: userId, tour: tour._id });

  res.status(200).render('tour', {
    title: 'Tour',
    tour,
    tourBookedDates: currentTourBookedDates,
    myReview,
  });
});

export const updateProfileByForm = catchAsync(async (req, res) => {
  const { name, email } = req.body;

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      name,
      email,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  res.locals.user = updatedUser;

  return res.status(200).render('profile', {
    title: 'My profile',
  });
});

export const getForgotPasswordPage = catchAsync(async (req, res, next) => {
  res.status(200).render('forgotPassword', { title: 'Forgot password' });
});

export const getResetPasswordPage = catchAsync(async (req, res, next) => {
  const { resetToken } = req.query;
  if (!resetToken) return next(new AppError(400, 'Reset token not   found'));

  const hashedResetToken = createHashedString(resetToken);
  const user = await User.findOne({
    resetPasswordToken: hashedResetToken,
    resetPasswordTokenExpireAt: { $gt: Date.now() },
  });

  if (!user)
    return next(new AppError(400, 'Reset token is invalid or expired'));

  res
    .status(200)
    .render('resetPassword', { title: 'Reset password', resetToken });
});

export const getMyBookingsPage = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  const myBookings = await Booking.find({ user: userId }).select(
    '_id startDate',
  );

  let toursForDisplay = myBookings.map(async (booking) => {
    const tour = await Tour.findById(booking.tour._id);
    return { startDate: booking.startDate, ...tour._doc };
  });

  toursForDisplay = await Promise.all(toursForDisplay);

  res.status(200).render('overview', {
    title: 'My bookings',
    isStartDate: true,
    tours: toursForDisplay,
  });
});

export const getMyReviewsPage = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const myReviews = await Review.find({ user: userId }).populate({
    path: 'tour',
    select: 'name imageCover slug',
  });

  console.log(myReviews);
  res.status(200).render('myReviews', { title: 'My reviews', myReviews });
});
