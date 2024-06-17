import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI);
  console.log(
    `Connected to database at ${conn.connection.host}:${conn.connection.port}`,
  );
};

export default connectDB;
