-- ARGV
local rt_prev_hash = ARGV[1]
local rt_new_hash  = ARGV[2]
local user_id      = ARGV[3]
local rt_ttl       = tonumber(ARGV[4])

-- KEYS
-- KEYS[1] = rt:<prev_hash>
-- KEYS[2] = rt:<new_hash>
-- KEYS[3] = user:<id>:rt

-- 1. Check old RT exists
if redis.call("EXISTS", KEYS[1]) == 0 then
  return 0
end

-- 2. Check RT belongs to user
if redis.call("SISMEMBER", KEYS[3], rt_prev_hash) == 0 then
  return 0
end

-- 3. Delete old RT
redis.call("DEL", KEYS[1])
redis.call("SREM", KEYS[3], rt_prev_hash)

-- 4. Store new RT
redis.call("SET", KEYS[2], user_id, "EX", rt_ttl)
redis.call("SADD", KEYS[3], rt_new_hash)

-- 5. Refresh SET TTL
redis.call("EXPIRE", KEYS[3], rt_ttl)

return 1
