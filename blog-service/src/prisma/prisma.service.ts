import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(config: ConfigService) {
    super({
      datasources: {
        db: {
          url: `postgresql://${config.get("DATABASE_USER")}:${config.get(
            "DATABASE_PASSWORD"
          )}@${config.get("DATABASE_HOST")}:${config.get(
            "DATABASE_PORT"
          )}/${config.get("DATABASE_NAME")}?schema=public`
        }
      }
    });
  }
}
