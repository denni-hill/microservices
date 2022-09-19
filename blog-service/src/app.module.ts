import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { PrismaModule } from "./prisma/prisma.module";
import { DAOModule } from "./dao/dao.module";
import path from "path";
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [
        path.join(process.cwd(), "..", ".env"),
        path.join(process.cwd(), ".env")
      ]
    }),
    AuthModule,
    UserModule,
    PrismaModule,
    DAOModule
  ]
})
export class AppModule {}
