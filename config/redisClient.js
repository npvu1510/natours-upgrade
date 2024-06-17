import redis from 'redis';

const redisClient = redis.createClient({
  host: 'localhost', // Đổi thành host của Redis nếu cần
  port: 6379, // Đổi thành port của Redis nếu cần
});

await redisClient.connect();

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

redisClient.on('ready', () => {
  console.log('Redis client is ready');
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

redisClient.on('end', () => {
  console.log('Redis client closed');
});

process.on('SIGINT', () => {
  redisClient.quit();
});

export default redisClient;
