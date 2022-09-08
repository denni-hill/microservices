import { build, validate } from "chain-validator-js";
import userDAO from "../dao/user.dao";
import { User } from "../database/entities/user.entity";
import ValidationError from "../errors/validation.error";
import authService from "./auth.service";
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
    .not()
    .contains(" ")
    .withMessage("should not contain spaces")
    .isLength({ min: 2, max: 20 }),
  sex: build().isBoolean(),
  isAdmin: build().optional()
});

//creates 4-length number to allow nickname collisions in [1000, 9999] to be easy to parse
const createUniqueNicknameDigits = async (
  nickname: string
): Promise<string> => {
  const random = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min)) + min;
  let digits = random(1000, 10000);
  while (await userDAO.isNicknameDigitsPairExist(nickname, digits)) {
    digits = random(1000, 10000);
  }

  return String(digits);
};

class UserService {
  async createUser(userDTO: Partial<User>): Promise<User> {
    const validationResult = await validate(
      userDTO,
      build().schema<User>({
        authUserId: build()
          .isInt()
          .bail()
          .custom(() => (id: Id) => authService.isAuthUserExist(id))
          .withMessage("Auth user does not exist")
          .bail()
          .not()
          .custom(() => (id: Id) => userDAO.isAuthUserIdRegistered(id))
          .withMessage("Auth user id is already registered in counter service"),
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
    await userDAO.findOne(userId, { notFound: true });

    const validationResult = await validate(
      userDTO,
      build().schema<User>(UserDTOValidationRules())
    );

    if (validationResult.failed) throw new ValidationError(validationResult);

    validationResult.validated.digits = await createUniqueNicknameDigits(
      validationResult.validated.nickname
    );

    return await userDAO.update(userId, validationResult.validated, {
      notFound: true
    });
  }

  async deleteUser(userId: Id): Promise<number> {
    return await userDAO.delete(userId, { notFound: true });
  }

  async deleteUserByAuthId(authUserId: Id): Promise<number> {
    return await userDAO.deleteByAuthUserId(authUserId, { notFound: true });
  }

  async getUser(userId: Id): Promise<User> {
    return await userDAO.findOne(userId, { notFound: true });
  }

  async getUserByUserAuthId(authUserId: Id): Promise<User> {
    return await userDAO.findByAuthUserId(authUserId, { notFound: true });
  }
}

const userService = new UserService();

messenger.consumeMessages("auth-user-deleted", async (msg) => {
  const authUserId = JSON.parse(msg.content.toString());

  userService
    .deleteUserByAuthId(authUserId)
    .then(() => {
      logger.info("User deleted on auth-user-deleted event", {
        authUserId
      });
    })
    .catch((e) => {
      logger.error(
        "Error occured during deleting user on auth-user-delted event",
        e
      );
    });
});

export default userService;
