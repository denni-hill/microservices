import { Module } from "@nestjs/common";
import { DAOModule } from "../dao/dao.module";
import {
  CreateUserDTOValidationPipe,
  UpdateUserDTOValidationPipe
} from "./joi/pipes";
import { UserDTOJoiSchemaProvider } from "./joi/providers";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";

@Module({
  controllers: [UserController],
  providers: [
    UserDTOJoiSchemaProvider,
    CreateUserDTOValidationPipe,
    UpdateUserDTOValidationPipe,
    UserService
  ],
  imports: [DAOModule]
})
export class UserModule {}
