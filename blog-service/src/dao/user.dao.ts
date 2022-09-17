import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateUserDTO, UpdateUserDTO } from "src/user/dto";

@Injectable()
export class UserDAO {
  constructor(private prisma: PrismaService) {}

  async create(userDTO: CreateUserDTO) {
    if (
      (await this.prisma.user.count({
        where: {
          authUserId: userDTO.authUserId
        }
      })) > 0
    )
      throw new ConflictException(
        "This auth user id is already registered in blog service"
      );

    try {
      return this.prisma.user.create({
        data: userDTO
      });
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }

  async update(userId: number, userDTO: UpdateUserDTO) {
    if (
      (await this.prisma.user.count({
        where: {
          id: userId
        }
      })) === 0
    )
      throw new NotFoundException({
        message: "User is not found",
        id: userId
      });

    return await this.prisma.user.update({
      where: {
        id: userId
      },
      data: userDTO
    });
  }
}
