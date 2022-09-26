import { Injectable } from "@nestjs/common";
import { JoiSchemaValidationPipe } from "../../../joi/pipes";
import { UserDTO } from "../../dto";
import { UserDTOJoiSchemaProvider } from "../providers";

@Injectable()
export class UpdateUserDTOValidationPipe extends JoiSchemaValidationPipe<
  UserDTO,
  UserDTO
> {
  constructor(userDTOSchemaProvider: UserDTOJoiSchemaProvider) {
    super(userDTOSchemaProvider.schema, { forbidden: { authUserId: true } });
  }
}
