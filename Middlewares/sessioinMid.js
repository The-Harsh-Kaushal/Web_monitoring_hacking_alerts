const crypto = require("crypto");
const User = require("../Modals/User");
const jwt = require("jsonwebtoken");
const { redis } = require("../Redis/RedisClient");
const fs = require("fs");
const path = require("path");
const { got_blocked } = require("./Monitoring and Security/traffic");
const At_ttl = process.env.AT_TTL;
const Rt_ttl = process.env.RT_TTL;
const Acess_token_secret = process.env.REFRESH_TOKEN_SECRET;
const Refresh_token_secret = process.env.ACCESS_TOKEN_SECRET;
//read the lua script
let CreateSessionLua, RefreshSessionLua, LogoutSessionLua;

try {
  CreateSessionLua = fs.readFileSync(
    path.resolve(__dirname, "../Redis/lua/Sessionhandling/tokenCreation.lua"),
    "utf8"
  );
  RefreshSessionLua = fs.readFileSync(
    path.resolve(__dirname, "../Redis/lua/Sessionhandling/refreshSession.lua"),
    "utf8"
  );
  LogoutSessionLua = fs.readFileSync(
    path.resolve(__dirname, "../Redis/lua/Sessionhandling/logoutScripting.lua"),
    "utf8"
  );
} catch (err) {
  console.error("❌ Failed to load Redis Lua script: session ", err.message);
  process.exit(1);
}

// load the script
let CreateSession_Sha, RefreshSession_Sha, LogoutSession_Sha;
async function loadAuthLuaScripts() {
  CreateSession_Sha = await redis.scriptLoad(CreateSessionLua);
  RefreshSession_Sha = await redis.scriptLoad(RefreshSessionLua);
  LogoutSession_Sha = await redis.scriptLoad(LogoutSessionLua);
}

// function to encrypt tokens
function sha256(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

// createsession middleware
const CreateSession = async (req, res, next) => {
  {
    const user = req.user;
    const payload = {
      id: user._id,
      email: user.email,
      uniqueId: user.uniqueId,
      isAdmin: user.isAdmin,
    };

    try {
      const accessToken = jwt.sign(payload, Acess_token_secret, {
        expiresIn: At_ttl,
      });
      const refreshToken = jwt.sign(payload, Refresh_token_secret, {
        expiresIn: Rt_ttl,
      });
      // creating hash of the refresh token so that save the actual token if REdis leaks
      const RTHash = sha256(refreshToken);
      await redis.evalSha(CreateSession_Sha, {
        keys: [`rt:${RTHash}`, `user:${user.uniqueId}:rt`],
        arguments: [String(user.uniqueId), String(Rt_ttl), String(RTHash)],
      });

      req.tokens = {
        accessToken: accessToken,
        refreshToken: refreshToken,
      };
      next();
    } catch (err) {
      console.log("Error while creating a session ", err);
      return res.status(500).json({
        msg: "session creation failed",
      });
    }
  }
};

const VerifySession = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      msg: "Token missing or malformed",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, Acess_token_secret);
    req.user = payload;
    next();
  } catch (err) {
    console.log("JWT verification failed:", err.message);
    return res.status(401).json({
      msg: "Invalid or expired token",
    });
  }
};

const RefreshSession = async (req, res, next) => {
  const refreshToken = req.cookies["refreshToken"];
  if (!refreshToken) {
    return res.status(400).json({
      msg: "No refersh token present",
    });
  }

  try {
    const payload = jwt.verify(refreshToken, Refresh_token_secret);
    const { iat, exp, ...rest } = payload;
    const newrefreshToken = jwt.sign(rest, Refresh_token_secret, {
      expiresIn: "7d",
    });
    const newaccessToken = jwt.sign(rest, Acess_token_secret, {
      expiresIn: "15m",
    });
    const RT_P_Hash = sha256(refreshToken);
    const RT_N_Hash = sha256(newrefreshToken);
    console.log(`user:${rest.uniqueId}:rt`);
    // if token is valid but not persent in db likely it's stolen so logout all sessions
    const allowed = await redis.evalSha(RefreshSession_Sha, {
      keys: [`rt:${RT_P_Hash}`, `rt:${RT_N_Hash}`, `user:${rest.uniqueId}:rt`],
      arguments: [
        String(RT_P_Hash),
        String(RT_N_Hash),
        String(rest.uniqueId),
        String(Rt_ttl),
      ],
    });
    if (!allowed) {
      got_blocked(
        Date.now(),
        req.ip,
        rest.uniqueId,
        "Session stealing",
        req.route?.path || req.path,
        req.method,
        300
      );
      return res.status(403).json({
        msg: "Token is stolen Loging out of all sessions",
      });
    }

    req.token = {
      accessToken: newaccessToken,
      refreshToken: newrefreshToken,
    };
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      msg: "Invalid refresh token",
    });
  }
};

const logout = async (req, res, next) => {
  const refreshToken = req.cookies["refreshToken"];
  const { mode } = req.body; // "single" | "all"
  if (mode !== "single" && mode !== "all") {
    return res.status(400).json({ msg: "Invalid logout mode" });
  }
  if (!refreshToken) {
    return res.status(401).json({
      msg: "error handling logout",
    });
  }
  try {
    const payload = jwt.verify(refreshToken, Refresh_token_secret);
    const { iat, exp, ...rest } = payload;
    const Rt_Hash = sha256(refreshToken);
    const allowed = await redis.evalSha(LogoutSession_Sha, {
      keys: [`user:${rest.uniqueId}:rt`],
      arguments: [String(mode), String(Rt_Hash)],
    });
    if (!allowed) return res.status(400).json({ msg: "Logout failed" });
    next();
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      msg: "internal server error",
    });
  }
};

module.exports = {
  CreateSession,
  VerifySession,
  RefreshSession,
  logout,
  loadAuthLuaScripts,
};
