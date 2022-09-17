import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { UserDAO } from "./user.dao";

@Module({
  imports: [PrismaModule],
  providers: [UserDAO],
  exports: [UserDAO]
})
export class DAOModule {}
