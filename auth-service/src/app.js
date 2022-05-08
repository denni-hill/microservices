const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config();
dotenv.config({ path: path.join(process.cwd(), "..", "services.env", ".env") });

const router = require("./router");

const redisClient = require("./redis");

const app = express();

redisClient.connect();

app.use((req, res, next) => {
  try {
    next();
  } catch (e) {
    console.log(e);
  }
});

app.use(router);

app.listen(80, () => console.log("Authorization service started"));
