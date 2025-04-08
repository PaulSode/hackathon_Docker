const Redis = require('ioredis');
const dotenv = require('dotenv');

dotenv.config();

const redisClient = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || '',
})

redisClient.on('connect', () => {
    console.log('Connected to Redis');
})

redisClient.on('error', (err) => {
    console.error('Redis connection error:', err);
})

module.exports = redisClient
