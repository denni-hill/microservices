import { User } from "@prisma/client";
import { AuthPayloadDTO } from "./auth-payload.dto";

export interface UserData extends User {
  auth: AuthPayloadDTO;
}
