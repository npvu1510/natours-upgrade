import AppError from '../utils/AppError.js';

// handle lỗi sai định dạng ObjectId
const handleCastError = (err) => {
  const message = `Invalid path ${err.path}: ${err.value}`;
  return new AppError(400, message);
};

// handle duplicate validation
const handleDuplicateError = (err) => {
  const key = Object.keys(err.keyValue)[0];
  const value = Object.values(err.keyValue)[0];

  const message = `Duplicate error ${key}: ${value}`;

  return new AppError(400, message);
};

const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = errors.join('. ');

  return new AppError(400, message);
};

const handleJWTTokenExpired = () => {
  return new AppError(401, 'Your session has expired. Please login again !');
};

const handleJsonWebTokenError = () => {
  return new AppError(401, 'Your token is invalid. Please login again !');
};

const handleUnknowError = () => {
  return new AppError(500, 'Something went wrong');
};

//  RESPONSE FUNCTIONS
const responseOnDevelopment = (err, req, res) => {
  console.log('🚫🚫 Error on development: ' + err.message);
  console.log(err);

  if (
    req.originalUrl.startsWith('/api/') ||
    err.name === 'TokenExpiredError' ||
    req.originalUrl.startsWith('/stripe')
  ) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,

      error: err,
      stack: err.stack,
    });
  }
  return res.status(err.statusCode).render('error', {
    message: err.message,
  });
};

const responseOnProduction = (err, req, res) => {
  console.log('🚫🚫 Error on production: ' + err);
  console.log(err);
  console.log(req.originalUrl.startsWith('/api/'));

  if (
    req.originalUrl.startsWith('/api/') ||
    req.originalUrl.startsWith('/stripe/get-checkout-session')
  ) {
    if (err.isOperational) {
      return res
        .status(err.statusCode)
        .json({ status: err.status, message: err.message });
    }

    return res.status(err.statusCode).json({
      status: err.status,
      message: 'Something went wrong',
      // error: err,
    });
  }
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', { message: err.message });
  }
  return res.status(500).render('error', { message: 'Something went wrong' });
};

const globalErrorHandler = (err, req, res, next) => {
  console.log(err);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    responseOnDevelopment(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let prodError = err;

    if (err.name === 'CastError') prodError = handleCastError(err);
    else if (err.code === 11000) prodError = handleDuplicateError(err);
    else if (err.name === 'ValidationError')
      prodError = handleValidationError(err);
    else if (err.name === 'TokenExpiredError')
      prodError = handleJWTTokenExpired();
    else if (err.name === 'JsonWebTokenError')
      prodError = handleJsonWebTokenError();
    else if (err.name === 'resetTokenError') prodError = handleUnknowError();

    responseOnProduction(prodError, req, res);
  }
};

export default globalErrorHandler;
