import { Redis } from 'ioredis'

const REDIS_URL: string | undefined = process.env.REDIS_URL
const redisClient = new Redis(REDIS_URL)

redisClient.on('connect', () => {
  console.log('Connected to Redis')
})

redisClient.on('error', (err: Error): void => {
  console.error('Redis error:', err)
})

export default redisClient
