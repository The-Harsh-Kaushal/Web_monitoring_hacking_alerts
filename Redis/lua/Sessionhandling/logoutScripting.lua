-- KEYS
-- KEYS[1] = user:<id>:rt

-- ARGV
-- ARGV[1] = mode ("single" | "all")
-- ARGV[2] = rt_hash (required for single)

local mode = ARGV[1]

-- -------- LOGOUT ALL --------
if mode == "all" then
  local hashes = redis.call("SMEMBERS", KEYS[1])

  for _, hash in ipairs(hashes) do
    redis.call("DEL", "rt:" .. hash)
  end

  redis.call("DEL", KEYS[1])
  return #hashes
end

-- -------- LOGOUT SINGLE --------
if mode == "single" then
  local rt_hash = ARGV[2]

  -- check ownership
  if redis.call("SISMEMBER", KEYS[1], rt_hash) == 0 then
    return 0
  end

  redis.call("DEL", "rt:" .. rt_hash)
  redis.call("SREM", KEYS[1], rt_hash)

  return 1
end

-- -------- INVALID MODE --------
return redis.error_reply("INVALID_LOGOUT_MODE")
