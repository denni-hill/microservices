import sourceMapSupport from "source-map-support";
import dotenv from "dotenv";
import path from "path";
import express, { Response } from "express";
import redisClient from "./redis";
import "reflect-metadata";
import { defaultDataSource } from "./database";
import router from "./router";
import BaseError from "./errors/base.error";
import InternalServerError from "./errors/internal.error";

sourceMapSupport.install();
dotenv.config();
dotenv.config({ path: path.join(process.cwd(), "..", "services.env", ".env") });

const app = express();

app.use(router);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((e, _req, res: Response, next) => {
  if (e instanceof BaseError) {
    if (e instanceof InternalServerError) console.log(e.error);
    else res.status(e.getStatusCode()).json(e.getResponseBody());
  } else console.log(e);
});

app.start = async () => {
  await defaultDataSource.initialize();
  console.log("Database is connected successfully...");
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

export default app;
