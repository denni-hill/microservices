import { build, validate } from "chain-validator-js";
import userDAO from "../dao/user.dao";
import { User } from "../database/entities/user.entity";
import ValidationError from "../errors/validation.error";
import authService from "./auth.service";
import messenger from "../rabbitmq/messenger";
import logger from "../logger";
import { Id } from "../dao/id";

export interface UserDTO {
  nickname: string;
  sex: boolean;
  digits?: number;
  authUserId?: number;
}

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
  sex: build().isBoolean()
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
  async createUser(userDTO: UserDTO): Promise<User> {
    const validationResult = await validate(
      userDTO,
      build().schema<UserDTO>({
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

    const user = await userDAO.create(validationResult.validated);

    messenger.sendMessage("counter-user-created", { user });
    return user;
  }

  async updateUser(userId: Id, userDTO: UserDTO): Promise<User> {
    await userDAO.findOne(userId, { notFound: true });

    const validationResult = await validate(
      userDTO,
      build().schema<UserDTO>(UserDTOValidationRules())
    );

    if (validationResult.failed) throw new ValidationError(validationResult);

    validationResult.validated.digits = await createUniqueNicknameDigits(
      validationResult.validated.nickname
    );

    return await userDAO.update(userId, validationResult.validated, {
      notFound: true
    });
  }

  async deleteUser(userId: Id, soft = true): Promise<number> {
    if (soft) return await userDAO.softDelete(userId, { notFound: true });
    else return await userDAO.delete(userId, { notFound: true });
  }

  async deleteUserByAuthId(authUserId: Id, soft = true): Promise<number> {
    if (soft)
      return await userDAO.softDeleteByAuthUserId(authUserId, {
        notFound: true
      });
    else
      return await userDAO.deleteByAuthUserId(authUserId, { notFound: true });
  }

  async restoreUser(userId: Id): Promise<number> {
    return await userDAO.restore(userId, { notFound: true });
  }

  async getUser(userId: Id): Promise<User> {
    return await userDAO.findOne(userId, { notFound: true });
  }

  async getUserByUserAuthId(authUserId: Id): Promise<User> {
    return await userDAO.findByAuthUserId(authUserId, { notFound: true });
  }
}

const userService = new UserService();

messenger.addEventListener("connect", (messenger) => {
  messenger.consumeMessages("auth-user-deleted", async (msg) => {
    const authUserId = JSON.parse(msg.content.toString());
    try {
      await userService.deleteUserByAuthId(authUserId);

      logger.info("User deleted on auth-user-deleted event", {
        authUserId
      });
    } catch (e) {
      logger.error(
        "Error occured during deleting user on auth-user-deleted event",
        e
      );
    }
  });
});

export default userService;
