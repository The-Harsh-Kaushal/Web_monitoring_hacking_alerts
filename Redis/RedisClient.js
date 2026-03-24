const { createClient } = require("redis");

const redis = createClient({ url: process.env.REDIS_URI });

redis.on("error", (err) => {
  console.error("Redis Error:", err);
});

let connectPromise;

async function connectRedis() {
  if (redis.isOpen) {
    return redis;
  }

  if (!connectPromise) {
    connectPromise = redis.connect().then(() => {
      console.log("Redis is UP");
      return redis;
    });
  }

  return connectPromise;
}

module.exports = { redis, connectRedis };
