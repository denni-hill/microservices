import { build, validate } from "chain-validator-js";
import userDAO from "../dao/user.dao";
import { User } from "../database/entities/user.entity";
import NotFoundError from "../errors/not-found.error";
import ValidationError from "../errors/validation.error";
import authService from "./auth.service";
import baseService from "./base.service";
import messenger from "../rabbitmq/messenger";
import logger from "../logger";
import { Id } from "../dao/id";

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
  while (await userDAO.isNicknameDigitsPairExist(nickname, digits)) {
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
          .bail(),
        // .not()
        // .custom(() => userDAO.isAuthUserIdRegistered)
        // .withMessage("Auth user id is already registered in counter service"),
        ...UserDTOValidationRules()
      })
    );

    if (validationResult.failed) throw new ValidationError(validationResult);

    validationResult.validated.digits = await createUniqueNicknameDigits(
      validationResult.validated.nickname
    );

    return await userDAO.create(validationResult.validated);
  }

  async updateUser(userId: Id, userDTO: Partial<User>): Promise<User> {
    await baseService.validateId(userId);

    if (!(await userDAO.isExist(userId)))
      throw new NotFoundError({ id: userId }, "User");

    const validationResult = await validate(
      userDTO,
      build().schema<User>(UserDTOValidationRules())
    );

    if (validationResult.failed) throw new ValidationError(validationResult);

    validationResult.validated.digits = await createUniqueNicknameDigits(
      validationResult.validated.nickname
    );

    return (await userDAO.update(userId, validationResult.validated))[0];
  }

  async deleteUser(userId: Id): Promise<number> {
    await baseService.validateId(userId);

    return await userDAO.delete(userId);
  }

  async deleteUserByAuthId(authUserId: Id): Promise<number> {
    await baseService.validateId(authUserId);

    return await userDAO.deleteByAuthUserId(authUserId);
  }

  async getUser(userId: Id): Promise<User> {
    await baseService.validateId(userId);

    const user = await userDAO.findOne(userId);

    if (user === undefined) throw new NotFoundError({ id: userId }, "User");
    return user;
  }

  async getUserByUserAuthId(authUserId: Id): Promise<User> {
    await baseService.validateId(authUserId);

    const user = await userDAO.findByAuthUserId(authUserId);

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
