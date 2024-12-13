import { RedisClientType, createClient } from "redis";

const redis: RedisClientType = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  },
});

redis
  .connect()
  .then((_) => console.log("Redis conneted"))
  .catch((err) => console.error("Redis connection failed\n" + err));

export default redis;
