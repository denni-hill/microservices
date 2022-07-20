import { build, validate } from "chain-validator-js";
import { DeepPartial } from "typeorm";
import UserDAO from "../dao/user";
import { User } from "../database/entities/user";
import { ValidationError } from "../errors/validation.error";

const UserDTOValidationRules = {
  nickname: build().isString().bail().trim().isLength({ min: 2, max: 20 }),
  sex: build().isBoolean(),
  isAdmin: build().optional()
};

class UserService {
  async createUser(userDTO: DeepPartial<User>): Promise<User> {
    const validationResult = await validate(
      userDTO,
      build().schema<User>({
        authUserId: build()
          .isNumeric()
          .bail()
          .not()
          .custom(
            () => async (authUserId: number) =>
              UserDAO.isAuthUserIdRegistered(authUserId)
          ),
        ...UserDTOValidationRules
      })
    );

    if (validationResult.failed) throw new ValidationError(validationResult);

    return await UserDAO.create(userDTO);
  }

  async updateUser(userId: number, userDTO: DeepPartial<User>): Promise<User> {
    const validationResult = await validate(
      userDTO,
      build().schema<User>(UserDTOValidationRules)
    );

    if (validationResult.failed) throw new ValidationError(validationResult);

    return (
      await UserDAO.update(
        {
          where: {
            id: userId
          }
        },
        userDTO
      )
    )[0];
  }

  async deleteUser(userId: number): Promise<boolean> {
    return (
      (await UserDAO.delete({
        where: {
          id: userId
        }
      })) > 0
    );
  }

  async deleteUserByAuthId(authUserId: number): Promise<boolean> {
    return (
      (await UserDAO.delete({
        where: { authUserId }
      })) > 0
    );
  }

  async getUser(userId: number) {
    return await UserDAO.findOne({
      where: {
        id: userId
      }
    });
  }

  async getUserByUserAuthId(authUserId: number) {
    return await UserDAO.findOne({
      where: {
        authUserId
      }
    });
  }
}

export default new UserService();
