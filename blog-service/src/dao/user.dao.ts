import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateUserDTO, UpdateUserDTO } from "src/user/dto";
import logger from "src/winston/logger";

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
      logger.error("Could not create user in database", {
        error: e,
        data: userDTO
      });
      throw new InternalServerErrorException();
    }
  }

  async getByAuthUserId(authUserId: number) {
    return await this.prisma.user.findUnique({
      where: {
        authUserId
      }
    });
  }

  async get(userId?: number) {
    if (userId === undefined) {
      return await this.prisma.user.findMany({ where: { isDeleted: false } });
    } else
      return await this.prisma.user.findFirst({
        where: { id: userId, isDeleted: false }
      });
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

  async delete(userId: number) {
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

    return await this.prisma.user.delete({
      where: { id: userId }
    });
  }

  async softDelete(userId: number) {
    if (
      (await this.prisma.user.count({
        where: {
          id: userId,
          isDeleted: false
        }
      })) === 0
    )
      throw new NotFoundException({
        message: "User is not found",
        id: userId
      });

    return await this.prisma.user.updateMany({
      where: { id: userId, isDeleted: false },
      data: { isDeleted: true }
    });
  }

  async restore(userId: number) {
    if (
      (await this.prisma.user.count({
        where: {
          id: userId,
          isDeleted: true
        }
      })) === 0
    )
      throw new NotFoundException({
        message: "User is not found",
        id: userId
      });

    return await this.prisma.user.updateMany({
      where: { id: userId, isDeleted: true },
      data: { isDeleted: false }
    });
  }
}
