import path from 'path';

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import morgan from 'morgan';

import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';

import compression from 'compression';

import tourRouter from './routes/tourRouter.js';
import authRouter from './routes/authRouter.js';
import userRouter from './routes/userRouter.js';
import reviewRouter from './routes/reviewRouter.js';
import viewRouter from './routes/viewRouter.js';
import bookingRouter from './routes/bookingRouter.js';
import stripeRouter from './routes/stripeRouter.js';

import globalErrorHandler from './controllers/errorController.js';
import AppError from './utils/AppError.js';

// CONFIGURATIONS
const __dirname = path.resolve();
dotenv.config({ path: '.env' });

process.on('uncaughtException', (err) => {
  console.log(`🧨 Uncaught exception`);
  console.log(`🧨 ${err.name}: ${err.message}`);
  console.log('📴 Shutting down...');

  process.exit(1);
});

const app = express();
app.use(cors());

// VIEW TEMPALTE
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// STATIC
app.use(express.static(path.join(__dirname, 'public')));

// PARSER MIDDLEWARES
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// SECURITY MIDDLEWARES
app.use(
  rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 100,

    message:
      'You have sent too many requests to the site. Please come back in 1 hour',
  }),
);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'", 'https:', 'localhost:'],
        scriptSrc: ["'self'", 'https:'],
        imgSrc: ["'self'", 'https:', 'data:'],
      },
    },
  }),
);

app.use(
  hpp({
    whitelist: ['duration', 'difficulty', 'ratingsAverage'],
  }),
);

// COMPRESSION
app.use(compression());

// MIDDLEWARES
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// WEBHOOK ROUTES
app.use('/stripe', stripeRouter);

// NORMAL ROUTERS
app.use(express.json({ limit: '10kb' }));
app.use(mongoSanitize());
app.use(xss());

app.use('/', viewRouter);
app.use('/api/tours', tourRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/bookings', bookingRouter);

// NOT FOUND ROUTE
app.all('*', (req, res, next) => {
  next(new AppError(404, `Can't find ${req.originalUrl} on this server`));
});

app.use(globalErrorHandler);

export default app;
