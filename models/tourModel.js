import mongoose from 'mongoose';

import slugify from 'slugify';
// import validator from 'validator';

// import User from './userModel.js';

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      trim: true,
      required: [true, 'A tour must have a name'],
      maxlength: [40, 'A tour name must have less or equal then 40 characters'],
      minlength: [3, 'A tour name must have more or equal then 3 characters'],
      // validate: [validator.isAlpha, 'A tour name must be alpha'],
      validate: {
        validator: function (value) {
          return /^[a-zA-Z ]+$/.test(value);
        },
        message: 'Tour name must be alpha',
      },
    },

    slug: String,

    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
      min: [1, 'A tour duration must be between 1 and 30'],
      max: [30, 'A tour duration must be between 1 and 30'],
    },

    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],

      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium or difficult',
      },
    },

    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a max group size'],

      min: [1, 'A group size must be at least 1 person'],
      max: [100, 'A group size must be less or equal then 10 people'],
    },

    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1.0, 'Rating must be above 1.0'],
      max: [5.0, 'Rating must be below 5.0'],

      set: function (value) {
        return Math.round(value * 100) / 100;
      },
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },

    price: {
      type: Number,
      required: true,
      min: [100, 'A tour price must be between 100 and 5000'],
      max: [5000, 'A tour price must be between 100 and 5000'],
    },

    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val <= 50 && val >= 10;
        },
        message: 'Discount percentage must be between 10 and 50',
      },
    },

    description: {
      type: String,
      trim: true,
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },

    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [
      {
        date: { type: Date, required: [true, 'A start date must have a date'] },
        participants: { type: Number, default: 0 },
        soldOut: { type: Boolean, default: false },
      },
    ],

    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      description: String,
      coordinates: [Number],
      address: String,
    },

    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        description: String,
        address: String,
        coordinates: [Number],
        day: Number,
      },
    ],

    // guides: Array, Embedding
    guides: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'A tour must have guides'],
      },
    ],

    secret: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// INDEXES
tourSchema.index({ slug: 1 }, { unique: true });
tourSchema.index({ ratingsAverage: 1, price: 1 });
tourSchema.index({ price: 1, ratingsAverage: 1 });

// virtual properties
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// document middleware
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// EMBEDDING
// tourSchema.pre('save', async function (next) {
//   const guidePromises = this.guides.map(async (guideId) =>
//     User.findOne({ _id: guideId }),
//   );

//   this.guides = await Promise.all(guidePromises);

//   next();
// });

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -lastPasswordChanged',
  });

  next();
});

// query middleware
tourSchema.pre(/^find/, function (next) {
  this.find({ secret: { $ne: true } });
  next();
});

// tourSchema.post(/^find/, function (docs, next) {
//   if (!docs) return next();

//   console.log(docs.length);
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);

export default Tour;
