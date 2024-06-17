import { promisify } from 'util';

import jwt from 'jsonwebtoken';

import User from '../models/userModel.js';

const setUserForRender = (req, res, next) => {
  req.isSetUser = true;
};

export default setUserForRender;
