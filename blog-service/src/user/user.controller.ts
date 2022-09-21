import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards
} from "@nestjs/common";
import { User } from "../auth/decorators";
import { UserData } from "../auth/dto";
import { JwtAuthGuard } from "../auth/guards";
import { IsAdminGuard } from "../auth/guards/is-admin.guard";
import { JwtAuthRegisteredGuard } from "../auth/guards/jwt-auth-registered.guard";
import { CreateUserDTO, UpdateUserDTO } from "./dto";
import { UserService } from "./user.service";

@Controller("users")
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Post("/register")
  register(@Body() dto: CreateUserDTO) {
    return this.userService.create(dto);
  }

  @UseGuards(JwtAuthRegisteredGuard)
  @Get("me")
  getMe(@User() user: UserData) {
    return this.userService.get(user.id);
  }

  @UseGuards(JwtAuthRegisteredGuard)
  @Patch("me")
  updateMe(@User() user: UserData, @Body() dto: UpdateUserDTO) {
    return this.userService.update(user.id, dto);
  }

  @UseGuards(JwtAuthRegisteredGuard, IsAdminGuard)
  @Post()
  create(@Body() dto: CreateUserDTO) {
    return this.userService.create(dto);
  }

  @UseGuards(JwtAuthRegisteredGuard, IsAdminGuard)
  @Get()
  getAll() {
    return this.userService.getAll();
  }

  @UseGuards(JwtAuthRegisteredGuard, IsAdminGuard)
  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.userService.get(id);
  }

  @UseGuards(JwtAuthRegisteredGuard, IsAdminGuard)
  @Patch(":id")
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateUserDTO) {
    return this.userService.update(id, dto);
  }

  @UseGuards(JwtAuthRegisteredGuard, IsAdminGuard)
  @Delete(":id")
  delete(@Param("id", ParseIntPipe) id: number) {
    return this.userService.delete(id);
  }
}
