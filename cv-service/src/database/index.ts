import path from "path";
import { DataSource } from "typeorm";

if (process.env.DATABASE_USER === undefined)
  process.env.DATABASE_USER = "cv_service_user";
if (process.env.DATABASE_PASSWORD === undefined)
  process.env.DATABASE_PASSWORD = "SuperSecretDBPassword";
if (process.env.DATABASE_NAME === undefined)
  process.env.DATABASE_NAME = "cv_database";

export const defaultDataSource = new DataSource({
  type: "postgres",
  host: "database",
  port: 5432,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  synchronize: true,
  entities: [path.join(process.cwd(), "build", "entities", "*.js")]
});
