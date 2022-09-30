import { ApiProperty } from "@nestjs/swagger";
import { UpdateUserDTO } from "./update-user.dto";

export class UserDTO extends UpdateUserDTO {
  @ApiProperty({ example: 1 })
  authUserId?: number;
}
