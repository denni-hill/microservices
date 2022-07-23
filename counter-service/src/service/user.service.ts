import { build, validate } from "chain-validator-js";
import UserDAO from "../dao/user";
import { User } from "../database/entities/user";
import NotFoundError from "../errors/not-found.error";
import ValidationError from "../errors/validation.error";
import { BaseService } from "./base.service";

const UserDTOValidationRules = () => ({
  nickname: build()
    .isString()
    .bail()
    .not()
    .contains("#")
    .bail()
    .trim()
    .isLength({ min: 2, max: 20 }),
  sex: build().isBoolean(),
  isAdmin: build().optional()
});

//creates 4-length number to allow nickname collisions in [1000, 9999] to be easy to parse
const createUniqueNicknameDigits = async (
  nickname: string
): Promise<string> => {
  const random = (min, max) => Math.floor(Math.random() * (max - min)) + min;
  let digits = random(1000, 10000);
  while (await UserDAO.isExist({ where: { nickname, digits } })) {
    digits = random(1000, 10000);
  }

  return digits;
};

class UserService extends BaseService {
  async createUser(userDTO: Partial<User>): Promise<User> {
    const validationResult = await validate(
      userDTO,
      build().schema<User>({
        authUserId: build()
          .isNumeric()
          .bail()
          .not()
          .custom(
            () => async (authUserId: number) =>
              await UserDAO.isAuthUserIdRegistered(authUserId)
          )
          .withMessage("Auth user id is already registered"),
        ...UserDTOValidationRules()
      })
    );

    if (validationResult.failed) throw new ValidationError(validationResult);

    validationResult.validated.digits = await createUniqueNicknameDigits(
      validationResult.validated.nickname
    );

    return await UserDAO.create(validationResult.validated);
  }

  async updateUser(userId: number, userDTO: Partial<User>): Promise<User> {
    await this.validateId(userId);

    const validationResult = await validate(
      userDTO,
      build().schema<User>(UserDTOValidationRules())
    );

    if (validationResult.failed) throw new ValidationError(validationResult);

    if (!(await UserDAO.isExist({ where: { id: userId } })))
      throw new NotFoundError({ id: userId }, "User");

    return (
      await UserDAO.update(
        {
          where: {
            id: userId
          }
        },
        validationResult.validated
      )
    )[0];
  }

  async deleteUser(userId: number): Promise<number> {
    await this.validateId(userId);

    if (!(await UserDAO.isExist({ where: { id: userId } })))
      throw new NotFoundError({ id: userId }, "User");

    return await UserDAO.delete({
      where: {
        id: userId
      }
    });
  }

  async deleteUserByAuthId(authUserId: number): Promise<number> {
    await this.validateId(authUserId);

    if (!(await UserDAO.isExist({ where: { authUserId } })))
      throw new NotFoundError({ authUserId }, "User");

    return await UserDAO.delete({
      where: { authUserId }
    });
  }

  async getUser(userId: number) {
    await this.validateId(userId);

    return await UserDAO.findOne({
      where: {
        id: userId
      }
    });
  }

  async getUserByUserAuthId(authUserId: number) {
    await this.validateId(authUserId);

    return await UserDAO.findOne({
      where: {
        authUserId
      }
    });
  }
}

export default new UserService();
