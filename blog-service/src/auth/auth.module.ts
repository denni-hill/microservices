import { Module } from "@nestjs/common";
import { DAOModule } from "src/dao/dao.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [DAOModule]
})
export class AuthModule {}
