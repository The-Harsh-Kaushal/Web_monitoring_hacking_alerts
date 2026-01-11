require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const { createGateway } = require("./config/config");
const { authenticationRoutes, sessionRoutes } = require("./config/routes");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

(async () => {
  // 1️⃣ Bootstrap gateway FIRST
  const gateway = await createGateway({});

  // 2️⃣ Attach gateway middleware
  app.use(gateway.middleware());

  // 3️⃣ Static + routes
  app.use(express.static("./static"));
  app.use("/api/auth", authenticationRoutes);
  app.use("/api/session", sessionRoutes);

  // 4️⃣ DB connection
  await mongoose.connect(process.env.MONGO_DB_URI);
  console.log("connection to DB successful");

  // 5️⃣ Start server LAST
  app.listen(5000, () => {
    console.log("app is listening at port 5000");
  });
})();
