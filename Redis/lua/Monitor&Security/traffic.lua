------------------------------------------------------------
-- KEYS:
-- KEYS[1] -> ZSET : per-endpoint request counter
-- KEYS[2] -> HASH : global traffic pressure (EWMA)
--           fields:
--             total_count
--             last_updated
-- KEYS[3] -> STRING : per-IP daily marker
-- KEYS[4] -> STRING : global unique IP counter
--
-- ARGV[1] -> Endpoint
-- ARGV[2] -> IP address
-- ARGV[3] -> current timestamp (seconds)
------------------------------------------------------------

-- Per-endpoint per-IP request count
redis.call("ZINCRBY", KEYS[1], 1, ARGV[1])
redis.call("EXPIRE", KEYS[1], 172800, "NX")

-- Fetch EWMA state
local data = redis.call("HMGET", KEYS[2], "total_count", "last_updated")

local total_count = tonumber(data[1]) or 0
local last_updated = tonumber(data[2]) or tonumber(ARGV[2])

local now = tonumber(ARGV[2])
local time_elapsed = now - last_updated
if time_elapsed < 0 then
    time_elapsed = 0
end

------------------------------------------------------------
-- EWMA LOGIC
------------------------------------------------------------

-- λ controls memory:
-- higher λ  -> forget faster
-- lower λ   -> smoother, longer memory
local lambda = 0.2

-- exponential decay
local decay = math.exp(-lambda * time_elapsed)

-- EWMA update
total_count = total_count * decay + 1

-- store updated state
redis.call(
    "HSET",
    KEYS[2],
    "total_count", total_count,
    "last_updated", now
)

------------------------------------------------------------
-- Unique IP tracking (per day)
------------------------------------------------------------
local created = redis.call("SET", KEYS[3], 1, "NX", "EX", 86400)
if created then
    redis.call("INCRBY", KEYS[4], 1)
    redis.call("EXPIRE", KEYS[4], 86400, "NX")
end

return 1
