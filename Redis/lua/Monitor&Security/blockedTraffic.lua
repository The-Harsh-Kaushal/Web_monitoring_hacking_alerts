-- KEYS[1] = blocked request hash key
--           example: blocked:req:<request_id>
--
-- KEYS[2] = blocked request index set (time-windowed)
--           example: blocked:index:2026-01-08
--
-- KEYS[3] = ban key for enforcement
--           example: ban:ip:<ip>

-- ARGV[1] = IP address
-- ARGV[2] = UID (user id / request id / trace id)
-- ARGV[3] = block reason (rate_limit, abuse, etc.)
-- ARGV[4] = route / endpoint
-- ARGV[5] = HTTP method
-- ARGV[6] = timestamp (epoch seconds or ms, string)
-- ARGV[7] = ban timeout in seconds (e.g. 300)

-- 1. Store blocked request metadata (LOG - immutable)
redis.call(
  "HSET",
  KEYS[1],
  "IP",     ARGV[1],
  "UID",    ARGV[2],
  "reason", ARGV[3],
  "route",  ARGV[4],
  "method", ARGV[5],
  "ts",     ARGV[6]
)

-- 2. Expire blocked request log after 7 days
redis.call("EXPIRE", KEYS[1], 604800)

-- 3. Add request key to daily index set
redis.call("SADD", KEYS[2], KEYS[1])

-- 4. Ensure index expires with same retention window (only set once)
redis.call("EXPIRE", KEYS[2], 604800, "NX")

-- 5. Set ban key with TTL (ENFORCEMENT STATE)
--    NX ensures we don't extend an existing ban accidentally
redis.call(
  "SET",
  KEYS[3],
  "1",
  "EX", ARGV[7],
  "NX"
)

return 1
