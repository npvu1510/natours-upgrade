import express from 'express';

import {
  getOverviewPage,
  getLoginPage,
  getProfilePage,
  getTourPage,
  // updateProfileByForm,
  getMyBookingsPage,
  getForgotPasswordPage,
  getResetPasswordPage,
  getSignupPage,
  getMyReviewsPage,
} from '../controllers/viewController.js';

import protectedViewRoute from '../middlewares/protectedViewRoute.js';
import redirectAuthenticatedUsers from '../middlewares/redirectAuthenticatedUsers.js';

const router = express.Router();

// router.use(setUserToRender);

const createProtectedViewMiddleware =
  (isRedirect) => async (req, res, next) => {
    req.isRedirect = isRedirect;
    await protectedViewRoute(req, res, next);
  };

// public routes
router.get(
  '/signup',
  createProtectedViewMiddleware(false),
  redirectAuthenticatedUsers,
  getSignupPage,
);

router.get(
  '/login',
  createProtectedViewMiddleware(false),
  redirectAuthenticatedUsers,
  getLoginPage,
);

router.get(
  '/forgot-password',
  createProtectedViewMiddleware(false),
  redirectAuthenticatedUsers,
  getForgotPasswordPage,
);

router.get(
  '/reset-password',
  createProtectedViewMiddleware(false),
  redirectAuthenticatedUsers,
  getResetPasswordPage,
);

// /public routes conditional render
router.get('/', createProtectedViewMiddleware(false), getOverviewPage);

// authenticated routes
router.get('/profile', createProtectedViewMiddleware(true), getProfilePage);

router.get('/tour/:slug', createProtectedViewMiddleware(true), getTourPage);

router.get(
  '/my-bookings',
  createProtectedViewMiddleware(true),
  getMyBookingsPage,
);

router.get(
  '/my-reviews',
  createProtectedViewMiddleware(true),
  getMyReviewsPage,
);
// router.post('/update-profile-by-form', protectedRoute, updateProfileByForm);

export default router;
