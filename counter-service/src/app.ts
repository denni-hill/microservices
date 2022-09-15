import sourceMapSupport from "source-map-support";
import express, { Response } from "express";
import redisClient from "./redis";
import "reflect-metadata";
import { defaultDataSource } from "./database";
import router from "./router";
import BaseError from "./errors/base.error";
import messenger from "./rabbitmq/messenger";
import logger from "./logger";

sourceMapSupport.install();

const app = express();

app.use(router);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((e, _req, res: Response, next) => {
  if (e instanceof BaseError) {
    res.status(e.getStatusCode()).json(e.getResponseBody());
  } else {
    res.status(500).send("Internal Server Error");
    logger.error("Unknown Error", e);
  }
});

app.start = async () => {
  try {
    await defaultDataSource.initialize();
    logger.info("Database is connected successfully");
  } catch (e) {
    logger.error("Failed to connecto database", e);
  }
  try {
    await redisClient.connect();
    logger.info("Redis client is connected successfully");
  } catch (e) {
    logger.error("Redis connection error", e);
  }
  try {
    await messenger.connect();
    logger.info("RabbitMQ is connected successfully");
  } catch (e) {
    logger.error("Could not connect RabbitMQ!", e);
  }

  app.server = await new Promise((res) => {
    const server = app.listen(process.env.PORT, () => {
      logger.info(`HTTP server started on port ${process.env.PORT}`);
      res(server);
    });
  });
};

app.stop = async () => {
  await redisClient.disconnect();
  await messenger.disconnect();
  await defaultDataSource.destroy();
  await new Promise((res) => {
    app.server.close(res);
  });
};

export default app;
