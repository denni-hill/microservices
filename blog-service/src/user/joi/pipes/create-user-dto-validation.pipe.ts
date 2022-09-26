import { Injectable } from "@nestjs/common";
import { JoiSchemaValidationPipe } from "../../../joi/pipes";
import { UserDTO } from "../../dto";
import { UserDTOJoiSchemaProvider } from "../providers";

@Injectable()
export class CreateUserDTOValidationPipe extends JoiSchemaValidationPipe<
  UserDTO,
  UserDTO
> {
  constructor(userDTOSchemaProvider: UserDTOJoiSchemaProvider) {
    super(userDTOSchemaProvider.schema, {
      required: {
        authUserId: true,
        firstName: true,
        lastName: true,
        sex: true
      }
    });
  }
}
