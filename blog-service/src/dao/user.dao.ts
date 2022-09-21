import {
  ConflictException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { UserEntity } from "src/typeorm/entities";
import { TypeormService } from "src/typeorm/typeorm.service";
import logger from "../winston/logger";
import { BaseDAO, DeepPartial } from "./base.dao";
import { DefaultThrowErrorsOptions, ThrowErrorsOptions } from "./misc";

@Injectable()
export class UserDAO extends BaseDAO<UserEntity> {
  constructor(typeORM: TypeormService) {
    super(typeORM.defaultDataSource, UserEntity, "User");
  }

  async create(dto: DeepPartial<UserEntity>): Promise<UserEntity> {
    if (await this.isAuthUserIdRegistered(dto.authUserId))
      throw new ConflictException(
        `${this.alias} with given auth user id is already registered`
      );

    return super.create(dto);
  }

  async getByAuthUserId(
    authUserId: number,
    throwErrorsOptions: ThrowErrorsOptions = new DefaultThrowErrorsOptions()
  ): Promise<UserEntity | null> {
    let user: UserEntity;
    try {
      user = await this.repository.findOne({
        where: { authUserId }
      });
    } catch (e) {
      logger.error(`Could not get ${this.alias} by auth user id in database`, {
        error: e,
        authUserId
      });
      throw e;
    }

    if (user === null && throwErrorsOptions.notFound) {
      logger.info(
        `${this.alias} is not found by auth user id exception thrown`,
        {
          authUserId
        }
      );
      throw new NotFoundException(`${this.alias} is not found`);
    }

    return user;
  }

  async isAuthUserIdRegistered(authUserId: number): Promise<boolean> {
    try {
      return (await this.repository.count({ where: { authUserId } })) > 0;
    } catch (e) {
      logger.error(
        `Could not check if ${this.alias} with given auth user id is registered in database`,
        {
          error: e,
          authUserId
        }
      );
      throw e;
    }
  }
}
