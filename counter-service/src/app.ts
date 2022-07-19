import sourceMapSupport from "source-map-support";
import dotenv from "dotenv";
import path from "path";
import express from "express";
import redisClient from "./redis";
import "reflect-metadata";
import { defaultDataSource } from "./database";

sourceMapSupport.install();
dotenv.config();
dotenv.config({ path: path.join(process.cwd(), "..", "services.env", ".env") });

const app = express();

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
