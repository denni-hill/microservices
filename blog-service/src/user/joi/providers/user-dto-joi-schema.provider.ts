import Joi, { ObjectSchema } from "joi";
import { idSchema } from "../../../joi/customs";
import { JoiSchemaProvider } from "../../../joi/providers";
import { UserDTO } from "../../dto";

export class UserDTOJoiSchemaProvider implements JoiSchemaProvider {
  get schema(): ObjectSchema<UserDTO> {
    return Joi.object<UserDTO, false, UserDTO>({
      authUserId: idSchema,
      firstName: Joi.string().trim().min(2).max(64),
      lastName: Joi.string().trim().min(2).max(64),
      sex: Joi.boolean()
    });
  }
}
