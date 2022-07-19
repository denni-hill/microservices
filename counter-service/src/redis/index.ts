import { createClient } from "redis";

const client = createClient({
  url: `redis://${process.env.REDIS_USERNAME}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:6379`
});

client.on("error", (err) => {
  console.log("Redis Client Error", err);
});

client.on("connect", () => {
  console.log("Redis cache server is connected successfully...");
});

export default client;
