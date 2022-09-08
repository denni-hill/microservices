import { build, validate } from "chain-validator-js";
import { User } from "../database/entities/user.entity";
import InternalServerError from "../errors/internal.error";
import NotFoundError from "../errors/not-found.error";
import ValidationError from "../errors/validation.error";
import logger from "../logger";
import { BaseDAO, DefaultThrowErrorsOptions } from "./base.dao";
import { DeepPartial } from "./deep-partial";
import { Id } from "./id";

class UserDAO extends BaseDAO<User> {
  protected readonly alias = "User";
  protected readonly entityClass = User;

  override async update(
    id: Id,
    data: DeepPartial<User>,
    throwErrorsOptions = new DefaultThrowErrorsOptions()
  ): Promise<User> {
    const newData = { ...data };
    delete newData.authUserId;
    return await super.update(id, newData, throwErrorsOptions);
  }

  async isAuthUserIdRegistered(authUserId: Id): Promise<boolean> {
    await this.validateId(authUserId);

    try {
      return (
        (await this.repository.count({
          where: { authUserId }
        })) > 0
      );
    } catch (e) {
      throw new InternalServerError(
        "Could not check if auth user id is already registered in counter service",
        e,
        { authUserId }
      );
    }
  }

  async findByNicknameDigits(
    nickname: string,
    digits: number,
    throwErrorsOptions = new DefaultThrowErrorsOptions()
  ): Promise<User> {
    let user: User;
    try {
      user = await this.repository.findOne({
        where: {
          nickname,
          digits
        }
      });
    } catch (e) {
      throw new InternalServerError(
        `Could not find ${this.alias} by nickname and digits in database`,
        e,
        {
          nickname,
          digits
        }
      );
    }

    if (throwErrorsOptions.notFound && user === undefined)
      throw new NotFoundError({ nickname, digits }, this.alias);

    return user;
  }

  async findByAuthUserId(
    authUserId: Id,
    throwErrorsOptions = new DefaultThrowErrorsOptions()
  ): Promise<User> {
    let user: User;
    try {
      user = await this.repository.findOne({
        where: { authUserId }
      });
    } catch (e) {
      throw new InternalServerError(
        `Could not find ${this.alias} by auth user id in database`,
        e,
        {
          authUserId
        }
      );
    }

    if (throwErrorsOptions.notFound && user === undefined)
      throw new NotFoundError({ authUserId }, this.alias);

    return user;
  }

  async isNicknameDigitsPairExist(
    nickname: string,
    digits: number
  ): Promise<boolean> {
    await Promise.all([
      this.validateNickname(nickname),
      this.validateDigits(digits)
    ]);

    try {
      return (
        (await this.repository.count({
          where: {
            nickname,
            digits
          }
        })) > 0
      );
    } catch (e) {
      throw new InternalServerError(
        "Could not check if nickname-digits pair is already exist in database",
        e,
        { nickname, digits }
      );
    }
  }

  async deleteByAuthUserId(
    authUserId: Id,
    throwErrorsOptions = new DefaultThrowErrorsOptions()
  ): Promise<number> {
    await this.validateId(authUserId);

    let affectedRowsCount: number;

    try {
      affectedRowsCount = (
        await this.repository.update({ authUserId }, { isDeleted: true })
      ).affected;
    } catch (e) {
      throw new InternalServerError(
        `Could not soft delete ${this.alias} by auth user id in database`,
        e,
        { authUserId }
      );
    }

    if (throwErrorsOptions.notFound && affectedRowsCount === 0)
      throw new NotFoundError({ authUserId }, this.alias);

    logger.info("User was soft deleted by auth user id", { authUserId });

    return affectedRowsCount;
  }

  override async delete(
    id: Id,
    throwErrorsOptions?: DefaultThrowErrorsOptions
  ): Promise<number> {
    await this.validateId(id);

    let affectedRowsCount: number;

    try {
      affectedRowsCount = (
        await this.repository.update({ id }, { isDeleted: true })
      ).affected;
    } catch (e) {
      throw new InternalServerError(
        `Could not soft delete ${this.alias} in database`,
        e,
        { id }
      );
    }

    if (throwErrorsOptions.notFound && affectedRowsCount === 0)
      throw new NotFoundError({ id }, this.alias);

    logger.info("User was soft deleted", { id });

    return affectedRowsCount;
  }

  protected async validateNickname(nickname: string): Promise<void> {
    const validationResult = await validate(
      nickname,
      build()
        .isString()
        .bail()
        .not()
        .contains("#")
        .withMessage("should not contain '#'")
        .not()
        .contains(" ")
        .withMessage("should not contain spaces")
    );

    if (validationResult.failed) throw new ValidationError(validationResult);
  }

  protected async validateDigits(digits: number): Promise<void> {
    const validationResult = await validate(
      digits,
      build().isInt({ min: 1000, max: 9999 })
    );

    if (validationResult.failed) throw new ValidationError(validationResult);
  }
}

export default new UserDAO();
