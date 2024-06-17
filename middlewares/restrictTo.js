import AppError from '../utils/AppError.js';

const restrictTo = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    next(new AppError(401, 'You are not allowed to access'));

  next();
};

export default restrictTo;
