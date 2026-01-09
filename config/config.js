const helmet = require("helmet");
const { connectRedis } = require("../Redis/RedisClient");

const {
  loadLuaScripts,
  AuthLB,
  RestLB,
} = require("../Middlewares/Rate Limiting/leakyBucketRateLimiting");
const { loadAuthLuaScripts } = require("../Middlewares/sessioinMid");
const {
  loadTrafficLuaScripts,
  Ip_filter,
  latency_Error_Tracker,
  Register_Traffic,
  got_blocked,
  Count_new_sub,
} = require("../Middlewares/Monitoring and Security/traffic");

/**
 * createGateway
 * Bootstraps redis + lua and returns gateway middleware
 */
const createGateway = async (userConfig = {}) => {
  const config = {
    redis: userConfig.redis ?? { url: process.env.REDIS_URI },
    enableHelmet: userConfig.enableHelmet ?? true,
    failOpen: userConfig.failOpen ?? true,
  };

  let redisHealthy = true;

  // 1️⃣ Redis bootstrap (optional but recommended)
  try {
    await connectRedis(config.redis.url);
  } catch (err) {
    redisHealthy = false;
    console.warn("[gateway] Redis unavailable");
    if (!config.failOpen) {
      throw err;
    }
  }

  // 2️⃣ Lua bootstrap (only if Redis is healthy)
  if (redisHealthy) {
    try {
      await loadLuaScripts();
      await loadAuthLuaScripts();
      await loadTrafficLuaScripts();
    } catch (err) {
      console.warn("[gateway] Lua scripts failed to load");

      if (!config.failOpen) {
        throw err;
      }
    }
  }

  // 3️⃣ Middleware pipeline (ORDER MATTERS)
  const pipeline = [];

  if (config.enableHelmet) {
    pipeline.push(helmet());
  }

  if (redisHealthy) {
    pipeline.push(Ip_filter, latency_Error_Tracker, Register_Traffic);
  }

  // 4️⃣ Public surface
  return {
    middleware: () => pipeline,

    status: () => ({
      redis: redisHealthy ? "up" : "down",
    }),
  };
};

module.exports = {
  createGateway,
  AuthLB,
  RestLB,
  got_blocked,
  Count_new_sub,
};
