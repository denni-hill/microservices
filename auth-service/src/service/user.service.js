const UserDAO = require("../dao/user");
const BlacklistedUserIdDAO = require("../dao/blacklisted-user-id");
const getUserHash = require("./get-user-hash");
const ValidationError = require("../errors/validation.error");
const NotFoundError = require("../errors/not-found.error");
const ConflictError = require("../errors/conflict.error");
const BaseService = require("./base.service");
const messenger = require("../rabbitmq/messenger");
const Joi = require("joi");
const sha256Schema = require("../joi/customs/is-sha256");

class UserService extends BaseService {
  getUserDtoValidationSchema(userEmail = undefined) {
    return Joi.object({
      email: Joi.string().trim().email(),
      password_hash: sha256Schema.when("email", {
        is: Joi.exist(),
        then: Joi.required()
      }),
      is_admin: Joi.bool(),
      first_name: Joi.string().trim().min(2).max(128),
      last_name: Joi.string().trim().min(2).max(128)
    });
  }

  async createUser(userDto) {
    const createUserDTOValidationSchema =
      this.getUserDtoValidationSchema().fork(
        ["email", "password_hash", "first_name", "last_name"],
        (field) => field.required()
      );

    let userData;
    try {
      userData = await createUserDTOValidationSchema.validateAsync(userDto, {
        allowUnknown: false
      });
    } catch (e) {
      throw new ValidationError(e);
    }

    if (await UserDAO.isEmailRegistered(userData.email))
      throw new ConflictError("Email is already registered");

    userData.hash = getUserHash(userData.email, userData.password_hash);

    return await UserDAO.createUser(userData);
  }

  async getUser(userId) {
    await this.validateId(userId);
    return await UserDAO.getUser(userId);
  }

  async updateUser(userId, userDto) {
    await this.validateId(userId);

    let validated;
    try {
      validated = await this.getUserDtoValidationSchema().validateAsync(
        userDto
      );
    } catch (e) {
      throw new ValidationError(e);
    }

    const user = await UserDAO.getUser(userId);

    if (user === undefined)
      throw new NotFoundError("User is not found", { id: userId });

    if (
      validated.email !== undefined &&
      validated.email !== user.email &&
      (await UserDAO.isEmailRegistered(validated.email))
    )
      throw new ConflictError("Email is already registered");

    if (validated.password_hash !== undefined) {
      if (validated.email !== undefined)
        user.hash = getUserHash(validated.email, validated.password_hash);
      else user.hash = getUserHash(user.email, validated.password_hash);
    }

    Object.assign(user, validated);

    return await UserDAO.updateUser(user.id, user);
  }

  async deleteUser(userId) {
    await this.validateId(userId);

    const res = await UserDAO.deleteUser(userId);
    if (res > 0) {
      await BlacklistedUserIdDAO.blacklistUserId(userId);
      await messenger.sendMessage("auth-user-deleted", userId);
    }
    return res;
  }

  async isExist(userId) {
    await this.validateId(userId);

    return await UserDAO.isExist(userId);
  }
}

module.exports = new UserService();
