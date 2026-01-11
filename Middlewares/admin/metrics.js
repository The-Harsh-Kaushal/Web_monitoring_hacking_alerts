const Traffic = require("../../Modals/Traffic");
const { redis } = require("../../Redis/RedisClient");

// simple YYYY-MM-DD validator
function isValidDateString(date) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}
const admin_check = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      msg: "authentication required",
    });
  }

  if (!req.user.isAdmin) {
    return res.status(403).json({
      msg: "admin permission required",
    });
  }

  next();
};

const aggregate_traffic = async (req, res) => {
  try {
    let { from, to } = req.query;

    if (!from) {
      return res.status(400).json({ error: "`from` date is required" });
    }

    if (!isValidDateString(from)) {
      return res.status(400).json({ error: "Invalid `from` date format" });
    }

    if (!to) to = from;

    if (!isValidDateString(to)) {
      return res.status(400).json({ error: "Invalid `to` date format" });
    }

    if (from > to) {
      return res.status(400).json({ error: "`from` cannot be after `to`" });
    }

    const result = await Traffic.aggregate([
      {
        $match: {
          date: { $gte: from, $lte: to },
        },
      },

      {
        $project: {
          Total_req: 1,
          subs_gained: 1,
          endpoint_traffic: { $objectToArray: "$endpoint_traffic" },
        },
      },

      {
        $unwind: {
          path: "$endpoint_traffic",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $group: {
          _id: null,
          total_req: { $sum: "$Total_req" },
          subs_gained: { $sum: "$subs_gained" },
          endpoints: {
            $push: {
              k: "$endpoint_traffic.k",
              v: "$endpoint_traffic.v",
            },
          },
        },
      },

      {
        $project: {
          _id: 0,
          total_req: 1,
          subs_gained: 1,
          endpoint_traffic: {
            $arrayToObject: {
              $map: {
                input: { $setUnion: ["$endpoints.k"] },
                as: "ep",
                in: {
                  k: "$$ep",
                  v: {
                    $sum: {
                      $map: {
                        input: {
                          $filter: {
                            input: "$endpoints",
                            as: "e",
                            cond: { $eq: ["$$e.k", "$$ep"] },
                          },
                        },
                        as: "x",
                        in: "$$x.v",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    ]);

    if (!result.length) {
      return res.json({
        from,
        to,
        total_req: 0,
        subs_gained: 0,
        endpoint_traffic: {},
      });
    }

    return res.status(200).json({
      from,
      to,
      ...result[0],
    });
  } catch (err) {
    console.error("Traffic aggregation failed:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const fetchTrafficMetrics = async (req, res, next) => {
  try {
    const day = new Date().toISOString().slice(0, 10);

    const latencyKey = `latency:${day}`;
    const errorKey = `error:${day}`;

    // Fetch both hashes in parallel
    const [latencyRaw, errorRaw] = await Promise.all([
      redis.hGetAll(latencyKey),
      redis.hGetAll(errorKey),
    ]);

    // If no data yet, don’t crash the app
    if (!latencyRaw || Object.keys(latencyRaw).length === 0) {
      req.metrics = {
        latency: null,
        errors: null,
      };
      return next();
    }

    const count = Number(latencyRaw.count || 0);
    const sumMs = Number(latencyRaw.sum_ms || 0);
    const maxMs = Number(latencyRaw.max_ms || 0);

    // Build latency buckets (everything except known meta fields)
    const buckets = {};
    for (const [key, value] of Object.entries(latencyRaw)) {
      if (!["count", "sum_ms", "max_ms"].includes(key)) {
        buckets[key] = Number(value);
      }
    }

    req.metrics = {
      latency: {
        totalRequests: count,
        avgMs: count > 0 ? sumMs / count : 0,
        maxMs,
        buckets,
      },
      errors: errorRaw
        ? {
            totalRequests: Number(errorRaw.total_req || 0),
            totalErrors: Number(errorRaw.errors || 0),
            byRoute: Object.fromEntries(
              Object.entries(errorRaw).filter(
                ([k]) => !["total_req", "errors"].includes(k)
              )
            ),
          }
        : null,
    };

    next();
  } catch (err) {
    console.error("Failed to fetch traffic metrics:", err);
    next();
  }
};
const fetchBlockedRequests = async (req, res, next) => {
  try {
    const indexKey = "blocked:req:index";

    // 1. Get all blocked request keys
    const blockedKeys = await redis.sMembers(indexKey);

    if (!blockedKeys || blockedKeys.length === 0) {
      req.blockedRequests = [];
      return next();
    }

    // 2. Fetch all blocked request hashes
    const blockedRequests = await Promise.all(
      blockedKeys.map(async (key) => {
        const data = await redis.hGetAll(key);

        if (!data || Object.keys(data).length === 0) {
          return null; // hash expired, index not cleaned yet
        }

        return {
          requestKey: key,
          ip: data.IP,
          uid: data.UID,
          reason: data.reason,
          route: data.route,
          method: data.method,
          timestamp: Number(data.ts),
        };
      })
    );

    // 3. Clean up nulls
    req.blockedRequests = blockedRequests.filter(Boolean);

    next();
  } catch (err) {
    console.error("Failed to fetch blocked requests:", err);
    next();
  }
};

const EWMA_and_Unique_Ip_count = async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const day = new Date().toISOString().slice(0, 10);

  const uniqueIpKey = `unique:ip:hll:${day}`; // HLL
  const ewmaKey = `ewma:global`;

  const intervalId = setInterval(async () => {
    try {
      const [uniqueIpCount, ewma] = await Promise.all([
        redis.pfCount(uniqueIpKey),
        redis.get(ewmaKey),
      ]);

      const payload = {
        uniqueIps: Number(uniqueIpCount || 0),
        ewma: ewma ? Number(ewma) : 0,
        timestamp: Date.now(),
      };

      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    } catch (err) {
      
      console.error("SSE metrics error:", err.message);
    }
  }, 1000);

  req.on("close", () => {
    clearInterval(intervalId); // ✅ CRITICAL
    res.end();
    console.log("SSE client disconnected");
  });
};

module.exports = {
  aggregate_traffic,
  admin_check,
  fetchTrafficMetrics,
  fetchBlockedRequests,
  EWMA_and_Unique_Ip_count
};
