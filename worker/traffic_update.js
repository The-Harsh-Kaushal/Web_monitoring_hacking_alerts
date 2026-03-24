const Traffic = require("../Modals/Traffic");
const { redis, connectRedis } = require("../Redis/RedisClient");
const cron = require("node-cron");

const MoveRedisToMongo = async () => {
  try {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const yesterday = d.toISOString().slice(0, 10);
    const trafficDate = new Date(`${yesterday}T00:00:00.000Z`);

    const response = await redis.zRangeWithScores(
      `EndPoint:Traffic:${yesterday}`,
      0,
      9,
      { REV: true }
    );

    // Nothing to migrate
    if (!response.length) return;

    const subs_gained = Number(
      (await redis.get(`new:user:count:${yesterday}`)) || 0
    );

    let total_req = 0;
    const endpoint_traffic = new Map();

    for (const entry of response) {
      const count = Number(entry.score);
      endpoint_traffic.set(entry.value, count);
      total_req += count;
    }

    // Idempotent write (safe for retries / multiple instances)
    await Traffic.updateOne(
      { date: trafficDate },
      {
        $set: {
          Total_req: total_req,
          subs_gained,
          endpoint_traffic,
        },
      },
      { upsert: true }
    );
  } catch (err) {
    console.error("Redis → Mongo migration failed:", err);
  }
};

let workerStarted = false;

async function startTrafficWorker() {
  if (workerStarted) {
    return;
  }

  await connectRedis();
  workerStarted = true;

  await MoveRedisToMongo();
  cron.schedule("0 0 * * *", async () => {
    await MoveRedisToMongo();
  });
}

module.exports = { MoveRedisToMongo, startTrafficWorker };
