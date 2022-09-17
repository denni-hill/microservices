import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { PrismaModule } from "./prisma/prisma.module";
import { DAOModule } from "./dao/dao.module";
@Module({
  imports: [AuthModule, UserModule, PrismaModule, DAOModule]
})
export class AppModule {}
