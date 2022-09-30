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
import { ApiBody } from "@nestjs/swagger";
import { User } from "../auth/decorators";
import { UserData } from "../auth/dto";
import {
  IsAdminGuard,
  JwtAuthGuard,
  JwtAuthRegisteredGuard
} from "../auth/guards";
import { UserEntity } from "../typeorm/entities";
import { UpdateUserDTO, UserDTO } from "./dto";
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
  async register(
    @Body(CreateUserDTOValidationPipe) dto: UserDTO
  ): Promise<UserEntity> {
    return await this.userService.create(dto);
  }

  @UseGuards(JwtAuthRegisteredGuard)
  @Get("me")
  async getMe(@User() user: UserData): Promise<UserEntity> {
    return await this.userService.get(user.id);
  }

  @UseGuards(JwtAuthRegisteredGuard)
  @Patch("me")
  @ApiBody({ type: UpdateUserDTO })
  async updateMe(
    @User() user: UserData,
    @Body(UpdateUserDTOValidationPipe) dto: UserDTO
  ): Promise<UserEntity> {
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
  @Get(":userId")
  async findOne(@Param("userId", ParseIntPipe) id: number) {
    return await this.userService.get(id);
  }

  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @Patch(":userId")
  @ApiBody({ type: UpdateUserDTO })
  async update(
    @Param("userId", ParseIntPipe) id: number,
    @Body(UpdateUserDTOValidationPipe) dto: UserDTO
  ) {
    return await this.userService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @Delete(":userId")
  async delete(@Param("userId", ParseIntPipe) id: number) {
    return await this.userService.delete(id);
  }
}
