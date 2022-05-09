const express = require("express");
const dotenv = require("dotenv");
const path = require("path");

if (process.env.NODE_ENV === "docker") {
  dotenv.config();
  dotenv.config({
    path: path.join(process.cwd(), "..", "services.env", ".env")
  });
}
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

const server = app.listen(process.env.PORT, () =>
  console.log("Authorization service started")
);

module.exports = server;
