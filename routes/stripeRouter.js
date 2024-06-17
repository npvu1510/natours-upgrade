import express from 'express';

import {
  getCheckoutSession,
  checkoutWebhook,
  checkSoldOutMiddleware,
} from '../controllers/stripeController.js';
import protectedApiRoute from '../middlewares/protectedApiRoute.js';
import { createBooking } from '../controllers/bookingController.js';

import { bookedCheckMiddleware } from '../controllers/stripeController.js';

const router = express.Router();

// STRIPE
router.get(
  '/get-checkout-session/:tourId',
  express.json({ limit: '10kb' }),
  protectedApiRoute,
  checkSoldOutMiddleware,
  bookedCheckMiddleware,
  getCheckoutSession,
);

router.post(
  '/checkout-webhook',
  express.raw({ type: 'application/json' }),
  checkoutWebhook,
  createBooking,
);

export default router;
