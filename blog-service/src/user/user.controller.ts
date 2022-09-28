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
import {
  IsAdminGuard,
  JwtAuthGuard,
  JwtAuthRegisteredGuard
} from "../auth/guards";
import { UserDTO } from "./dto";
import {
  CreateUserDTOValidationPipe,
  UpdateUserDTOValidationPipe
} from "./joi/pipes";
import { UserService } from "./user.service";

@Controller("users")
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Post("/register")
  async register(@Body(CreateUserDTOValidationPipe) dto: UserDTO) {
    return await this.userService.create(dto);
  }

  @UseGuards(JwtAuthRegisteredGuard)
  @Get("me")
  async getMe(@User() user: UserData) {
    return await this.userService.get(user.id);
  }

  @UseGuards(JwtAuthRegisteredGuard)
  @Patch("me")
  async updateMe(
    @User() user: UserData,
    @Body(UpdateUserDTOValidationPipe) dto: UserDTO
  ) {
    return await this.userService.update(user.id, dto);
  }

  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @Post()
  async create(@Body(CreateUserDTOValidationPipe) dto: UserDTO) {
    return await this.userService.create(dto);
  }

  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @Get()
  async getAll() {
    return await this.userService.getAll();
  }

  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return await this.userService.get(id);
  }

  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @Patch(":id")
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body(UpdateUserDTOValidationPipe) dto: UserDTO
  ) {
    return await this.userService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @Delete(":id")
  async delete(@Param("id", ParseIntPipe) id: number) {
    return await this.userService.delete(id);
  }
}
