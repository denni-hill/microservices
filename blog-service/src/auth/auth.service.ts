import { Injectable } from "@nestjs/common";

@Injectable()
export class AuthService {
  login() {
    return "login route";
  }

  register() {
    return { message: "register route" };
  }
}
