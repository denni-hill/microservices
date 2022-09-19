import { IsBoolean, IsOptional } from "class-validator";
import { RegisterUserDTO } from "./register-user.dto";

export class CreateUserDTO extends RegisterUserDTO {
  @IsOptional()
  @IsBoolean()
  isAdmin?: boolean;
}
