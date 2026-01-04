
local Unique_id = ARGV[1];
local RT_TTL = tonumber(ARGV[2]);
local RT_Hash = ARGV[3];

---- KEYS
-- KEYS[1] = RT key  (rt:<hash>)
-- KEYS[2] = user:<id>:rt   (SET)

redis.call("SET", KEYS[1], Unique_id, "EX", RT_TTL);

redis.call("SADD", KEYS[2], RT_Hash);
redis.call("EXPIRE", KEYS[2], RT_TTL);
