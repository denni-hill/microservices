import { UserEntity } from "src/typeorm/entities";
import { AuthPayloadDTO } from "./auth-payload.dto";

export interface UserData extends UserEntity {
  auth: AuthPayloadDTO;
}
