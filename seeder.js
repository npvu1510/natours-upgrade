import fs from 'fs';
import path from 'path';

import connectDB from './config/db.js';

import Tour from './models/tourModel.js';
import User from './models/userModel.js';
import Review from './models/reviewModel.js';

const __dirname = path.resolve();

connectDB();
console.log('Connecting...');

let tours = fs.readFileSync(
  path.join(__dirname, 'dev-data', 'data', 'tours.json'),
  'utf-8',
);
tours = JSON.parse(tours);

let reviews = fs.readFileSync(
  path.join(__dirname, 'dev-data', 'data', 'reviews.json'),
  'utf-8',
);
reviews = JSON.parse(reviews);

let users = fs.readFileSync(
  path.join(__dirname, 'dev-data', 'data', 'users.json'),
  'utf-8',
);
users = JSON.parse(users);

const importData = async () => {
  try {
    const restructuredTour = tours.map((tour) => {
      return {
        ...tour,
        startDates: tour.startDates.map((d) => {
          return {
            date: d,
          };
        }),
      };
    });

    await User.create(users, {
      validateBeforeSave: false,
    });
    await Tour.create(restructuredTour);
    await Review.create(reviews);

    console.log('Data imported');
    process.exit(0);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Review.deleteMany({});
    await Tour.deleteMany({});
    await User.deleteMany({});
    console.log('Data destroyed');
    process.exit(0);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

if (process.argv[2] === '--import') importData();
else if (process.argv[2] === '--destroy') destroyData();
