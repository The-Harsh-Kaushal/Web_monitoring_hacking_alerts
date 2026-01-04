const { createClient } = require("redis");
const {config}= require('../config/index');

const redis = createClient({
  url: config.redis.uri,
});

redis.on("error", (err) => console.log("Redis Error : ", err));
async function connectRedis() {
  await redis.connect();
  console.log("Redis is UP");
}
module.exports = { redis, connectRedis };
