import { RedisClientType, createClient } from "redis";

const redis: RedisClientType = createClient({
  url: process.env.REDIS_URL || "",
});

const startRedisServer = () => {
  console.log("Connecting to Redis...");
  redis
    .connect()
    .then((_) => console.log("Redis conneted"))
    .catch((err) => console.error("Redis connection failed\n" + err));
};

export default redis;
export { startRedisServer };
