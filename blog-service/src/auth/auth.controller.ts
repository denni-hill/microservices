import { Body, Controller, Post } from "@nestjs/common";
import { CreateUserDTO } from "src/user/dto";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("register")
  register(@Body() dto: CreateUserDTO) {
    return this.authService.register(dto);
  }
}
