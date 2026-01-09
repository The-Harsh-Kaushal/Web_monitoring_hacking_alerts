const Traffic = require("../Modals/Traffic");
const { redis } = require("../Redis/RedisClient");
const cron = require("node-cron");

const MoveRedisToMongo = async () => {
  try {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const yesterday = d.toISOString().slice(0, 10);

    // Top 10 endpoints → 10 members = 20 array items
    const response = await redis.zRevRange(
      `EndPoint:Traffic:${yesterday}`,
      0,
      19,
      { WITHSCORES: true }
    );

    // Nothing to migrate
    if (!response.length) return;

    const subs_gained = Number(
      (await redis.get(`new:user:count:${yesterday}`)) || 0
    );

    let total_req = 0;
    const endpoint_traffic = new Map();

    for (let i = 0; i < response.length; i += 2) {
      const count = Number(response[i + 1]);
      endpoint_traffic.set(response[i], count);
      total_req += count;
    }

    // Idempotent write (safe for retries / multiple instances)
    await Traffic.updateOne(
      { date: yesterday },
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

MoveRedisToMongo();
cron.schedule("0 0 * * *", async () => {
  await MoveRedisToMongo();
});
