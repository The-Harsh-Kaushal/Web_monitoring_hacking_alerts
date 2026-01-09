const { createClient } = require("redis");

let redis;

async function connectRedis(url) {
  if (redis) return redis; // prevent double connections
  redis = createClient({ url });
  console.log(url);
  redis.on("error", (err) => {
    console.error("Redis Error:", err);
  });

  await redis.connect();
  console.log("Redis is UP");

  return redis;
}

module.exports = { connectRedis, getRedis: () => redis };
