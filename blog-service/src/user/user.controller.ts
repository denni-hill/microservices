import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Patch,
  Post
} from "@nestjs/common";
import { CreateUserDTO, UpdateUserDTO } from "./dto";
import { UserService } from "./user.service";

@Controller("users")
export class UserController {
  constructor(private userService: UserService) {}
  @Post()
  create(@Body() dto: CreateUserDTO) {
    return this.userService.create(dto);
  }

  @Patch(":id")
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateUserDTO) {
    return this.userService.update(id, dto);
  }
}
