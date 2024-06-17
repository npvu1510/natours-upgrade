import jwt from 'jsonwebtoken';
import redisClient from '../config/redisClient.js';
import AppError from './AppError.js';
import User from '../models/userModel.js';

const verifyToken = (token, isRefresh = false) => {
  const secretKey = !isRefresh
    ? process.env.JWT_SECRET_KEY
    : process.env.JWT_SECRET_KEY_FOR_REFRESH;

  return new Promise((resolve, reject) => {
    jwt.verify(token, secretKey, async (err, payload) => {
      if (err) {
        reject(err);
      } else {
        const { _id, iat, exp } = payload;

        if (isRefresh) {
          const user = await User.findById(_id);
          if (!user) reject(new AppError(401, 'User not found'));

          const isValidToken = await redisClient.get(_id.toString());
          if (!isValidToken) reject(new AppError(401, "You're not logged in"));
        }

        resolve(true);
      }
    });
  });
};

export default verifyToken;
