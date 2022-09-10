import dotenv from "dotenv";
import path from "path";

dotenv.config();
dotenv.config({ path: path.join(process.cwd(), "..", ".env") });

process.env.DATABASE_HOST =
  process.env.REDIS_HOST =
  process.env.RABBITMQ_HOST =
  process.env.ELK_HOST =
    "localhost";
process.env.AUTH_SERVICE_HOST = "http://localhost/auth";

import { defaultDataSource } from "../../database";

beforeAll(async () => {
  await defaultDataSource.initialize();
});

// describe("test counter service", () => {});
