import dotenv from 'dotenv';
import connectDB from './config/db.js';

import app from './app.js';

dotenv.config({ path: '.env' });
connectDB();

const port = process.env.PORT || 9999;
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}...`);
});

process.on('unhandledRejection', (err) => {
  console.log(`🧨 Unhandled rejection`);
  console.log(`🧨 ${err.name}: ${err.message}`);

  server.close(() => {
    console.log('📴 Shutting down...');
    process.exit(1);
  });
});
