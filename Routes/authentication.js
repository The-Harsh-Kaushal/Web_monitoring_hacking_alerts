const express = require("express");
const router = express.Router();
const { LoginMiddleware, SignInMiddleware } = require("../Middlewares/authentication/authMid");
const {
  CreateSession,
  sessionCookiePath,
  isSecureCookie,
} = require("../Middlewares/authentication/sessioinMid");
const { AuthLB } = require("../config/config");

router.post("/login", AuthLB(), LoginMiddleware, CreateSession, (req, res) => {
  const tokens = req.tokens;
  res.cookie("refreshToken", tokens.refreshToken, {
    httpOnly: true,
    sameSite: "strict",
    path: sessionCookiePath,
    secure: isSecureCookie,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });

  res.status(200).json({
    msg: "sucessfull Login",
    accessToken: tokens.accessToken,
  });
});

router.post("/signin", AuthLB(), SignInMiddleware, CreateSession, (req, res) => {
  const tokens = req.tokens;
  res.cookie("refreshToken", tokens.refreshToken, {
    httpOnly: true,
    sameSite: "strict",
    path: sessionCookiePath,
    secure: isSecureCookie,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
  res.status(200).json({
    msg: "sucessfull SignIn",
    accessToken: tokens.accessToken,
  });
});
router.post("/reset", (req, res) => {
  res.status(200).json({
    msg: "reset sucessfull",
  });
});

module.exports = router;
