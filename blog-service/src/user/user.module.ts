import { Module } from "@nestjs/common";
import { DAOModule } from "../dao/dao.module";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [DAOModule]
})
export class UserModule {}
