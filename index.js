require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const { createGateway } = require("./config/config");
const { authenticationRoutes, sessionRoutes, adminRoutes } = require("./config/routes");
const { startTrafficWorker } = require("./worker/traffic_update");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

(async () => {
  try {
    const gateway = await createGateway({});

    app.use(gateway.middleware());
    app.use(express.static("./static"));
    app.use("/api/auth", authenticationRoutes);
    app.use("/api/session", sessionRoutes);
    app.use("/api", adminRoutes);

    await mongoose.connect(process.env.MONGO_DB_URI);
    console.log("connection to DB successful");

    startTrafficWorker();

    const port = Number(process.env.PORT) || 5000;
    app.listen(port, () => {
      console.log(`app is listening at port ${port}`);
    });
  } catch (err) {
    console.error("failed to start app", err);
    process.exit(1);
  }
})();
