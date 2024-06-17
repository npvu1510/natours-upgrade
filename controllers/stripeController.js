import Stripe from 'stripe';

// MODELS
import Tour from '../models/tourModel.js';
import User from '../models/userModel.js';

// CONTROLLERS
import { createBooking } from '../controllers/bookingController.js';

import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import Booking from '../models/bookingModel.js';

// middleware
export const checkSoldOutMiddleware = catchAsync(async (req, res, next) => {
  const { tourId } = req.params;

  const tour = await Tour.findById(tourId);
  if (!tour) return next(new AppError(404, 'No tour found with that ID'));

  let { startDate: startDateString } = req.query;
  if (!startDateString)
    return next(new AppError(400, 'Please choose one of start date'));

  const startDate = new Date(startDateString);
  if (Number.isNaN(startDate.getTime())) {
    return next(new AppError(400, 'Invalid start date'));
  }

  const startDateFromDb = tour.startDates.find((date, idx) =>
    startDate.getTime() === date.date.getTime() ? date : false,
  );

  if (!startDateFromDb)
    return next(new AppError(422, 'This tour date not found.'));

  if (startDateFromDb.soldOut)
    return next(new AppError(422, 'This tour is sold out'));

  next();
});

export const bookedCheckMiddleware = catchAsync(async (req, res, next) => {
  const { tourId: tour } = req.params;
  const user = req.user._id;

  const { startDate: startDateString } = req.query;
  const startDate = new Date(startDateString);

  const bookingsByUser = await Booking.find({ user, tour, startDate });
  if (bookingsByUser && bookingsByUser.length !== 0)
    return next(new AppError(422, 'You have already booked this tour'));

  next();
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const getCheckoutSession = catchAsync(async (req, res, next) => {
  const { tourId } = req.params;
  const { startDate: startDateString } = req.query;
  const startDate = new Date(startDateString);

  console.log(`startDate from session: `, startDate);
  console.log(`startDate from session: `, startDate.getTime());

  const tour = await Tour.findById(tourId);

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],

    customer_email: req.user.email,
    client_reference_id: tourId,

    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: tour.name,

            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          },
          unit_amount: tour.price * 100,
        },
        quantity: 1,
      },
    ],

    metadata: {
      startDate,
    },
    success_url: `${req.protocol}://${req.get('host')}`,
    cancel_url: `${req.protocol}://${req.get('host')}/${tourId}`,
  });

  if (!session) return next(new AppError(500, 'Something went wrong'));

  return res.status(200).json({ status: 'success', session });
});

export const checkoutWebhook = catchAsync(async (req, res, next) => {
  // console.log('WEBHOOK IS HERE');
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    if (process.env.NODE_ENV === 'production')
      next(new AppError(500, 'Lỗi thanh toán'));
    else return next(new AppError(500, err.message));
  }

  if (event.type === 'checkout.session.completed') {
    // Handle the event
    const checkoutSessionCompleted = event.data.object;

    const user = await User.findOne({
      email: checkoutSessionCompleted.customer_email,
    });
    const tour = await Tour.findOne({
      _id: checkoutSessionCompleted.client_reference_id,
    });
    const price = checkoutSessionCompleted.amount_total / 100;

    const startDate = new Date(
      checkoutSessionCompleted.metadata.startDate * 1000,
    );

    // Lưu thông tin vào cơ sở dữ liệu
    await Booking.create({
      user: user._id,
      tour: tour._id,
      price,
      isPaid: true,
      startDate,
    });

    return res.status(200).json({ received: true });
  }

  return next(new AppError(400, 'Thanh toán không thành công'));
});
