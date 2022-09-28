import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DataSource } from "typeorm";
import * as entities from "./entities";

@Injectable()
export class TypeormService {
  defaultDataSource: DataSource;
  constructor(config: ConfigService) {
    this.defaultDataSource = new DataSource({
      type: "postgres",
      host: config.get("DATABASE_HOST"),
      port: config.get("DATABASE_PORT"),
      database: config.get("DATABASE_NAME"),
      username: config.get("DATABASE_USER"),
      password: config.get("DATABASE_PASSWORD"),
      synchronize: true,
      entities: [...Object.values(entities)],
      migrations: ["./migrations"],
      migrationsTableName: "typeorm_migrations"
    });
  }

  async initializeDataSources() {
    await this.defaultDataSource.initialize();
  }
}
