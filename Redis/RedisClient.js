const { createClient } = require("redis");

const redis = createClient({ url : process.env.REDIS_URI });
redis.on("error", (err) => {
  console.error("Redis Error:", err);
});
redis.connect(); // let it throw
console.log("Redis is UP");

module.exports = { redis };
