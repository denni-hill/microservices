import path from "path";
import { DataSource } from "typeorm";

const host = process.env.DATABASE_HOST || "localhost";
const database = process.env.DATABASE_NAME || "counter_database";
const username = process.env.DATABASE_USER || "counter_service_user";
const password = process.env.DATABASE_PASSWORD || "CounterUserPassword";

export const defaultDataSource = new DataSource({
  type: "postgres",
  host,
  port: 5432,
  username,
  password,
  database,
  synchronize: true,
  entities: [path.join(process.cwd(), "build", "database", "entities", "*.js")]
});
