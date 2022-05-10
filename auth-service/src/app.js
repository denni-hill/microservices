const redisClient = require("./redis");
const router = require("./router");
const express = require("express");

/**
 * @type { import("express").Application & {async start(): Promise<import("http").Server> async stop(): Promise<void>}}
 */
const app = express();

app.use(async (err, _req, _res, next) => {
  console.log(err);
});

app.use(router);

app.start = async () => {
  require("./database/knex");
  await redisClient.connect();
  app.server = await new Promise((res) => {
    const server = app.listen(process.env.PORT, () => {
      console.log(`HTTP server started on port ${process.env.PORT}`);
      res(server);
    });
  });
};

app.stop = async () => {
  await redisClient.disconnect();
  await new Promise((res) => {
    app.server.close(res);
  });
};

module.exports = app;
