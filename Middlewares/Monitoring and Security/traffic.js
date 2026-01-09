const { redis } = require("../../Redis/RedisClient");
const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");
let TrafficLuaScript, BlockReqLua;
try {
  TrafficLuaScript = fs.readFileSync(
    path.resolve(__dirname, "../../Redis/lua/Monitor&Security/traffic.lua"),
    "utf8"
  );
  BlockReqLua = fs.readFileSync(
    path.resolve(
      __dirname,
      "../../Redis/lua/Monitor&Security/blockedTraffic.lua"
    ),
    "utf8"
  );
} catch (err) {
  console.error("❌ Failed to load Redis Lua script: traffic", err.message);
  process.exit(1);
}

let TrafficSha, BlockedReqSha;

async function loadTrafficLuaScripts() {
  TrafficSha = await redis.scriptLoad(TrafficLuaScript);
  BlockedReqSha = await redis.scriptLoad(BlockReqLua);
}

function getBucket(latencyMs) {
  if (latencyMs < 50) return "lt_50";
  if (latencyMs < 100) return "50_100";
  if (latencyMs < 200) return "100_200";
  if (latencyMs < 500) return "200_500";
  if (latencyMs < 1000) return "500_1000";
  return "gt_1000";
}

const Register_Traffic = async (req, res, next) => {
  const day = new Date().toISOString().slice(0, 10);

  const endpoint =
    req.route?.path ?? req.baseUrl + req.path ?? req.originalUrl.split("?")[0];

  const ip =
    req.headers["cf-connecting-ip"] ||
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.ip;

  const nowSeconds = Math.floor(Date.now() / 1000);

  try {
    await redis.evalSha(TrafficSha, {
      keys: [
        `EndPoint:Traffic:${day}`,
        `EWMA:GLOBAL`,
        `ip:${ip}`,
        `Unique:IP:Counter:${day}`,
      ],
      arguments: [String(endpoint),String(ip), String(nowSeconds)],
    });
  } catch (err) {
    console.error("Traffic monitoring failed:", err.message);
  }

  next();
};
// middleware/latency.js
const latency_Error_Tracker = (req, res, next) => {
  const start = process.hrtime.bigint();

  res.on("finish", async () => {
    try {
      const end = process.hrtime.bigint();
      const latencyMs = Number(end - start) / 1e6;

      const bucket = getBucket(latencyMs);

      const day = new Date().toISOString().slice(0, 10);
      const route = req.route?.path || req.path;
      const key = `latency:${day}:${req.method}:${route}`;
      // key to track error rate
      const key2 = `error:${day}`;

      const pipeline = redis.multi();
      //logic to track error rate
      pipeline.hincrby(key2, "total_req", 1);
      if (res.statusCode >= 400) {
        pipeline.hincrby(key2, "errors", 1);
        pipeline.hincrby(key2, `${req.method}:/${route}`, 1);
      }

      pipeline.hincrby(key, bucket, 1);
      pipeline.hincrby(key, "count", 1);
      pipeline.hincrbyfloat(key, "sum_ms", latencyMs);

      // update max_ms safely
      pipeline.hget(key, "max_ms");
      pipeline.exec(async (err, replies) => {
        if (err) return;
        const index = res.statusCode >= 400 ? 6 : 4;
        const currentMax = Number(replies[index][1] || 0);
        if (latencyMs > currentMax) {
          await redis.hset(key, "max_ms", latencyMs);
        }
      });

      // set expiry once (cheap + safe)
      await redis.expire(key, 86400, "NX");
      await redis.expire(key2, 86400, "NX");
    } catch (e) {
      console.log(e);
    }
  });

  next();
};
const got_blocked = async (
  timeStamp,
  ip,
  uid,
  reason,
  route,
  method,
  ban_timeout
) => {
  const response = await redis
    .evalSha(BlockedReqSha, {
      keys: [
        `blocked:req:${randomUUID()}`,
        `blocked:req:index`,
        `ban:ip:${ip}`,
      ],
      arguments: [
        String(ip),
        String(uid),
        String(reason),
        String(route),
        String(method),
        String(timeStamp),
        String(ban_timeout),
      ],
    })
    .catch((err) => {
      console.error("[blocked_req] redis eval failed", {
        err: err?.message,
        ip,
        uid,
        reason,
      });
    });
};
const Ip_filter = async (req, res, next) => {
  let isBanned = false;

  try {
    isBanned = await redis.exists(`ban:ip:${req.ip}`);
  } catch (err) {
    // FAIL OPEN — do NOT block traffic if Redis is unhealthy
    console.error("[ip_filter] redis error", err);
    return next();
  }

  // If IP is banned → block immediately
  if (isBanned) {
    // Fire-and-forget logging (NO await)
    got_blocked(
      Date.now(),
      req.ip,
      "UNKNOWN", // uid intentionally skipped
      "ip_timeout",
      req.route?.path || req.path,
      req.method,
      300
    );

    return res.status(429).json({
      msg: "temporarily blocked",
    });
  }

  return next();
};
const Count_new_sub = async () => {
  const time = new Date().toISOString.slice(0, 10);
  await redis.incrBy(`new:user:count:${time}`, 1).catch((err) => {
    console.log("unable to register new sub entry");
  });
  await redis.expire(`new:user:count:${time}`, 172800, "NX").catch((err) => {
    console.log("unable to log the new sub");
  });
};

module.exports = {
  loadTrafficLuaScripts,
  Register_Traffic,
  latency_Error_Tracker,
  got_blocked,
  Ip_filter,
  Count_new_sub,
};
