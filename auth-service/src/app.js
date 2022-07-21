const redisClient = require("./redis");
const router = require("./router");
const express = require("express");
const BaseError = require("./errors/base.error");
const InternalServerError = require("./errors/internal.error");

/**
 * @type { import("express").Application & {
 *  async start(): Promise<import("http").Server
 *  async stop(): Promise<void>
 * }}
 */
const app = express();

app.use(router);

app.use((e, req, res, next) => {
  if (e instanceof BaseError) {
    if (e instanceof InternalServerError) console.log(e.error);
    else res.status(e.getStatusCode()).json(e.getResponseBody());
  } else console.log(e);
});

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
