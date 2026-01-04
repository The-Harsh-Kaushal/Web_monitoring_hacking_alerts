function must(value, name) {
  if (!value) {
    throw new Error(`${name} is missing`);
  }
  return value;
}

const config = Object.freeze({
  mongo: {
    uri: must(process.env.MONGO_DB_URI, "MONGO_DB_URI"),
  },
  redis: {
    uri: must(process.env.REDIS_URI, "REDIS_URI"),
  },
  auth: {
    AT_TTL: Number(must(process.env.AT_TTL, "AT_TTL")),
    RT_TTL: Number(must(process.env.RT_TTL, "RT_TTL")),
    REFRESH_TOKEN_SECRET: must(
      process.env.REFRESH_TOKEN_SECRET,
      "REFRESH_TOKEN_SECRET"
    ),
    ACCESS_TOKEN_SECRET: must(
      process.env.ACCESS_TOKEN_SECRET,
      "ACCESS_TOKEN_SECRET"
    ),
  },
});

module.exports = { config };
