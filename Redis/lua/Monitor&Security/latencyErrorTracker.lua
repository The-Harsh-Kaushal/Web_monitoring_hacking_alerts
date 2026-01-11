-- KEYS[1] = latency key
-- KEYS[2] = error key
-- ARGV[1] = bucket
-- ARGV[2] = latencyMs
-- ARGV[3] = isError (0 or 1)
-- ARGV[4] = methodRoute
-- ARGV[5] = ttl

redis.call("HINCRBY", KEYS[2], "total_req", 1)

if ARGV[3] == "1" then
  redis.call("HINCRBY", KEYS[2], "errors", 1)
  redis.call("HINCRBY", KEYS[2], ARGV[4], 1)
end

redis.call("HINCRBY", KEYS[1], ARGV[1], 1)
redis.call("HINCRBY", KEYS[1], "count", 1)
redis.call("HINCRBYFLOAT", KEYS[1], "sum_ms", ARGV[2])

local currentMax = tonumber(redis.call("HGET", KEYS[1], "max_ms")) or 0
local latency = tonumber(ARGV[2])

if latency > currentMax then
  redis.call("HSET", KEYS[1], "max_ms", latency)
end

redis.call("EXPIRE", KEYS[1], ARGV[5], "NX")
redis.call("EXPIRE", KEYS[2], ARGV[5], "NX")

return 1