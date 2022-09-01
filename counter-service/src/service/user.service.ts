import { build, validate } from "chain-validator-js";
import UserDAO from "../dao/user";
import { User } from "../database/entities/user";
import NotFoundError from "../errors/not-found.error";
import ValidationError from "../errors/validation.error";
import authService from "./auth.service";
import BaseService from "./base.service";
import messenger from "../rabbitmq/messenger";
import logger from "../logger";

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

class UserService {
  async createUser(userDTO: Partial<User>): Promise<User> {
    const validationResult = await validate(
      userDTO,
      build().schema<User>({
        authUserId: build()
          .isInt()
          .bail()
          .custom(() => authService.isAuthUserExist)
          .withMessage("Auth user does not exist")
          .bail()
          .not()
          .custom(() => UserDAO.isAuthUserIdRegistered)
          .withMessage("Auth user id is already registered in counter service"),
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
    await BaseService.validateId(userId);

    if (!(await UserDAO.isExist({ where: { id: userId } })))
      throw new NotFoundError({ id: userId }, "User");

    const validationResult = await validate(
      userDTO,
      build().schema<User>(UserDTOValidationRules())
    );

    if (validationResult.failed) throw new ValidationError(validationResult);

    validationResult.validated.digits = await createUniqueNicknameDigits(
      validationResult.validated.nickname
    );

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
    await BaseService.validateId(userId);

    return await UserDAO.delete({
      where: {
        id: userId
      }
    });
  }

  async deleteUserByAuthId(authUserId: number): Promise<number> {
    await BaseService.validateId(authUserId);

    return await UserDAO.delete({
      where: { authUserId }
    });
  }

  async getUser(userId: number): Promise<User> {
    await BaseService.validateId(userId);

    const user = await UserDAO.findOne({
      where: {
        id: userId
      }
    });

    if (user === undefined) throw new NotFoundError({ id: userId }, "User");
    return user;
  }

  async getUserByUserAuthId(authUserId: number): Promise<User> {
    await BaseService.validateId(authUserId);

    const user = await UserDAO.findOne({
      where: {
        authUserId
      }
    });

    if (user === undefined) throw new NotFoundError({ authUserId }, "User");

    return user;
  }
}

const userService = new UserService();

messenger.consumeMessages("auth-user-deleted", (msg) => {
  const authUserId = JSON.parse(msg.content.toString());
  userService
    .deleteUserByAuthId(authUserId)
    .then(() => {
      logger.info("User deleted due to auth-user-deleted event", {
        authUserId
      });
    })
    .catch((e) => {
      logger.error(
        "Error occured during deleting user due to auth-user-delted event",
        e
      );
    });
});

export default userService;
