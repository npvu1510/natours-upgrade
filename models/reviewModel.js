import mongoose from 'mongoose';

import Tour from './tourModel.js';

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'A review is required'],
    },

    rating: {
      type: Number,
      required: [true, 'A rating is required'],
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },

    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
// Index
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// VIRTUAL PROPERTIES

// VIRTUAL POPULATE
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: '-__v -lastPasswordChanged',
  });
  next();
});

// DOCUMENT MIDDLEWARE
reviewSchema.post('save', async function (doc, next) {
  const stats = await Review.calcAvgRating(doc.tour);

  if (stats.length > 0)
    await Tour.findByIdAndUpdate(doc.tour, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].nRating,
    });
  else {
    await Tour.findByIdAndUpdate(doc.tour, {
      ratingsAverage: 4.5,
      ratingsQuantity: 0,
    });
  }
});

// QUERY MIDDLEWARE
reviewSchema.post(/^findOneAnd/, async function (doc, next) {
  const stats = await Review.calcAvgRating(doc.tour);

  if (stats.length > 0)
    await Tour.findByIdAndUpdate(doc.tour, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].nRating,
    });
  else {
    await Tour.findByIdAndUpdate(doc.tour, {
      ratingsAverage: 4.5,
      ratingsQuantity: 0,
    });
  }
});

// STATIC METHODS
reviewSchema.statics.calcAvgRating = async function (tourId) {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$tour',
        avgRating: { $avg: '$rating' },
        nRating: { $sum: 1 },
      },
    },
    { $match: { _id: tourId } },
  ]);

  return stats;
};

const Review = mongoose.model('Review', reviewSchema);
export default Review;
