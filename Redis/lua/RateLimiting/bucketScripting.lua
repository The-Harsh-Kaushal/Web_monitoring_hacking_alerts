-- Read hash values
local PCValue = redis.call("HMGET", KEYS[1], "currentCapacity", "lastReset")
local IPValue = redis.call("HMGET", KEYS[2], "currentCapacity", "lastReset")

-- Parse arguments
local capacity = tonumber(ARGV[1])
local window_size = tonumber(ARGV[2])
local date_now = tonumber(ARGV[3])
local ip_factor = tonumber(ARGV[4])
local exp_factor = tonumber(ARGV[5])

-- Basic arg validation (fail fast)
if not capacity or not window_size or not date_now or not ip_factor or not exp_factor then
    return redis.error_reply("Invalid ARGV")
end

------------------------------------------------
-- PC bucket normalization
------------------------------------------------
local pc_capacity = tonumber(PCValue[1])
local pc_last = tonumber(PCValue[2])

if not pc_capacity or not pc_last then
    pc_capacity = capacity
    pc_last = date_now
end

------------------------------------------------
-- IP bucket normalization
------------------------------------------------
local ip_capacity = tonumber(IPValue[1])
local ip_last = tonumber(IPValue[2])

if not ip_capacity or not ip_last then
    ip_capacity = capacity * ip_factor
    ip_last = date_now
end

------------------------------------------------
-- Refill logic (token bucket)
------------------------------------------------
local pc_delta = math.max(date_now - pc_last, 0)
local ip_delta = math.max(date_now - ip_last, 0)

local pc_inc_by = pc_delta / (window_size / capacity)
local ip_inc_by = ip_delta / (window_size / (capacity * ip_factor))

local new_pc_capacity = math.min(capacity, pc_capacity + pc_inc_by)
local new_ip_capacity = math.min(capacity * ip_factor, ip_capacity + ip_inc_by)

------------------------------------------------
-- Reject if either bucket empty
------------------------------------------------
if new_pc_capacity < 1 or new_ip_capacity < 1 then
    return 0
end

------------------------------------------------
-- Consume token + persist
------------------------------------------------
local ttl_seconds = math.floor((window_size / 1000) * exp_factor)

redis.call("HSET", KEYS[1], "currentCapacity", new_pc_capacity - 1, "lastReset", date_now)
redis.call("EXPIRE", KEYS[1], ttl_seconds)

redis.call("HSET", KEYS[2], "currentCapacity", new_ip_capacity - 1, "lastReset", date_now)
redis.call("EXPIRE", KEYS[2], ttl_seconds)

return 1
