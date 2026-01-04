require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const authenticationRoutes = require("./Routes/authentication");
const sessionRoutes = require("./Routes/session");
const { VerifySession, loadAuthLuaScripts } = require("./Middlewares/sessioinMid");
const {
  AuthLB,
  RestLB,
  loadLuaScripts,
} = require("./Middlewares/Rate Limiting/leakyBucketRateLimiting");
const { redis, connectRedis } = require("./Redis/RedisClient");
const {config}= require('./config/index');


const app = express();
//security middleware
app.use(helmet());
//translating middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/auth",AuthLB(2,60000,10,2),  authenticationRoutes);
app.use("/session", sessionRoutes);

app.use(express.static("./static"));

async function startServer() {
  try {
    await connectRedis();
     
    await mongoose.connect(`${config.mongo.uri}`);
    console.log("connection to DB sucessfull");

    app.listen(5000, () => {
      console.log("app is listening at port 5000.........");
    });
  } catch (err) {
    console.log("StartUp failed : ", err);
    process.exit(1);
  }
}
startServer();
loadLuaScripts();
loadAuthLuaScripts();