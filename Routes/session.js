const express = require("express");
const { RefreshSession, logout, VerifySession } = require("../Middlewares/sessioinMid");
const router = express.Router();

router.get("/refresh", RefreshSession, async (req, res,) => {
  const token = req.token;
  res.cookie("refreshToken", token.refreshToken, {
    httpOnly: true,
    path: "/session",
    secure: false,
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
  return res.status(200).json({
    msg: " sucessfully refreshed",
    accessToken: token.accessToken,
  });
});
router.post('/logout',logout,async(req,res,)=>{
    res.status(200).json({
        msg: " Logout sucessfull"
    })
})


router.get("/hello",VerifySession, (req, res) => {
  res.status(200).json({
    msg: "sucessfull ",
  });
});
module.exports = router;
