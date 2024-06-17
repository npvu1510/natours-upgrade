import fs from 'fs';
import path from 'path';
import multer, { memoryStorage } from 'multer';
import sharp from 'sharp';

import Tour from '../models/tourModel.js';

import ApiFilter from '../utils/ApiFilter.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

// handle factory functions
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from './handleFactory.js';

// MIDDLEWARES
// export const checkTourId = (req, res, next, val) => {
//   console.log(val);
//   next();
// };

export const get5BestCheapTours = (req, res, next) => {
  req.query.sort = '-ratingsAverage,price';
  req.query.limit = 5;

  next();
};

//  @route  GET api/tours
//  @desc   get all tours
//  @access PUBLIC
// export const getTours = catchAsync(async (req, res, next) => {
//   const countDocuments = await Tour.countDocuments();
//   const api = new ApiFilter(req.query, Tour, countDocuments)
//     .filter()
//     .sort()
//     .fields()
//     .pagination();

//   if (api.error) next(new AppError(400, api.error));

//   // A wait result
//   const tours = await api.queryRes;
//   res
//     .status(200)
//     .json({ status: 'success', data: { length: tours.length, tours } });
// });
export const getTours = getAll(Tour);

//  @route  GET api/tours
//  @desc   Get tour
//  @access PUBLIC
// export const getTour = catchAsync(async (req, res, next) => {
//   const { tourId } = req.params;

//   const tour = await Tour.findById(tourId).populate({
//     path: 'reviews',
//     select: '-__v -createdAt -updatedAt',
//   });

//   if (!tour) return next(new AppError(404, 'Tour not found'));

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
// });
export const getTour = getOne(Tour, {
  path: 'reviews',
  select: '-__v -createdAt -updatedAt',
});

//  @route  POST api/tours
//  @desc   create tour
//  @access PRIVATE/ADMIN
// export const createTour = catchAsync(async (req, res, next) => {
//   const newTour = await Tour.create(req.body);

//   await newTour.save();

//   res.status(201).json({ status: ' success', data: { tour: newTour } });
// });
export const createTour = createOne(Tour);

//  @route  PATCH api/tours
//  @desc   update tour
//  @access PRIVATE/ADMIN
// export const updateTour = catchAsync(async (req, res, next) => {
//   const { tourId } = req.params;

//   const updatedTour = await Tour.findByIdAndUpdate(tourId, req.body, {
//     new: true,
//     reValidators: true,
//   });

//   if (!updatedTour) return next(new AppError(404, 'Tour not found'));

//   res.status(200).json({ status: 'success', data: { tour: updatedTour } });
// });
export const updateTour = updateOne(Tour);

//  @route  DELETE api/tours
//  @desc   delete tour
//  @access PRIVATE/ADMIN
// export const deleteTour = catchAsync(async (req, res, next) => {
//   const { tourId } = req.params;

//   await Tour.findByIdAndDelete(tourId);
//   return res.status(204).json({ status: 'success', data: null });
// });
export const deleteTour = deleteOne(Tour);

export const getTourStats = catchAsync(async (req, res) => {
  const stats = await Tour.aggregate([
    { $match: { price: { $lt: 1000 } } },
    {
      $group: {
        _id: '$difficulty',
        count: { $sum: 1 },
        ratingAvg: { $avg: '$ratingsAverage' },
        maxRatingQuantity: { $max: '$ratingsQuantity' },
      },
    },

    { $match: { _id: { $ne: 'easy' } } },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

export const getMonthlyPlan = catchAsync(async (req, res) => {
  const year = req.query.year * 1;
  const data = await Tour.aggregate([
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        count: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: {
        month: 1,
      },
    },
  ]);

  res.status(200).json({ status: 'success', data: data });
});

// upload
const storage = memoryStorage();
const fileFilter = (req, file, callback) => {
  const ext = path.extname(file.originalname);

  if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
    return callback(new Error('Only images are allowed'));
  }
  callback(null, true);
};

export const processTourImages = catchAsync(async (req, res, next) => {
  if (!req.files) return next();

  if (req.files.imageCover) {
    const imageCoverFileName = `tour-${req.files.imageCover[0].fieldname}-${Date.now()}.jpeg`;

    await sharp(req.files.imageCover[0].buffer)
      .resize(12, 12)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/tours/${imageCoverFileName}`);

    req.body.imageCover = imageCoverFileName;
  }

  if (req.files.images) {
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (file, idx) => {
        const imageFileName = `tour-${file.fieldname}_${idx + 1}-${Date.now()}.jpeg`;

        await sharp(file.buffer)
          .resize(12, 12)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(`public/img/tours/${imageFileName}`);

        req.body.images.push(imageFileName);
      }),
    );
  }

  next();
});

export const uploadTourImages = multer({ storage });
