import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tour',
      required: [true, 'Booking must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Booking must belong to a user'],
    },
    price: {
      type: Number,
      required: [true, 'Booking must have a price'],
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    startDate: {
      type: Date,
      // required: [true, 'Booking must have a start date'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// VIRTUALS

// DOCUMENT MIDDLEWARES
bookingSchema.post('save', async function () {
  const { tour: tourId, startDate } = this;

  const TourModel = this.model('Tour');
  const currentTour = await TourModel.findById(tourId);
  console.log(currentTour);

  currentTour.startDates.find((sd) => {
    if (sd.date.getTime() === startDate.getTime()) {
      console.log(sd.date, startDate);
      sd.participants += 1;
      if (sd.participants === currentTour.maxGroupSize) sd.soldOut = true;
      return true;
    }
    return false;
  });

  await currentTour.save();
});

// QUERY MIDDLEWARES
bookingSchema.pre(/^find/, function () {
  this.populate('user').populate({
    path: 'tour',
    select: 'name',
  });
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
