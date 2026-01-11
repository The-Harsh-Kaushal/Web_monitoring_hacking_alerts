const helmet = require("helmet");
const { connectRedis } = require("../Redis/RedisClient");

const {
  loadLuaScripts,
  AuthLB,
  RestLB,
} = require("../Middlewares/Rate Limiting/leakyBucketRateLimiting");
const { loadAuthLuaScripts } = require("../Middlewares/authentication/sessioinMid");
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
const createGateway = async ({ enableHelmet }) => {

  // 1️⃣ Redis bootstrap (optional but recommended)

  // 2️⃣ Lua bootstrap (only if Redis is healthy)

  try {
    await loadLuaScripts();
    await loadAuthLuaScripts();
    await loadTrafficLuaScripts();
  } catch (err) {
    console.warn("[gateway] Lua scripts failed to load");
    throw err;
  }

  // 3️⃣ Middleware pipeline (ORDER MATTERS)
  const pipeline = [];

  if (enableHelmet) {
    pipeline.push(helmet());
  }
  pipeline.push(Ip_filter, latency_Error_Tracker, Register_Traffic);

  // 4️⃣ Public surface
  return {
    middleware: () => pipeline,
  };
};

module.exports = {
  createGateway,
  AuthLB,
  RestLB,
  got_blocked,
  Count_new_sub,
};
