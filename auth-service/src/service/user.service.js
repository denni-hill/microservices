const { build, validate } = require("chain-validator-js");
const UserDAO = require("../dao/user");
const BlacklistedUserIdDAO = require("../dao/blacklisted-user-id");
const getUserHash = require("./get-user-hash");
const ValidationError = require("../errors/validation.error");
const NotFoundError = require("../errors/not-found.error");
const BaseService = require("./base.service");

class UserService extends BaseService {
  async createUser(userDto) {
    const validationResult = await validate(
      userDto,
      build().schema({
        email: build()
          .isString()
          .bail()
          .trim()
          .isEmail()
          .not()
          .custom(() => async (email) => {
            return await UserDAO.isEmailRegistered(email);
          })
          .withMessage("email already registered"),
        password_hash: build().isString().bail().trim().isHash("sha256"),
        is_admin: build().optional().isBoolean(),
        first_name: build().isString().bail().trim().isLength({ min: 2 }),
        last_name: build().isString().bail().trim().isLength({ min: 2 })
      })
    );

    if (validationResult.failed) throw new ValidationError(validationResult);

    const userData = { ...validationResult.validated };

    userData.hash = getUserHash(userData.email, userData.password_hash);

    return await UserDAO.createUser(userData);
  }

  async getUser(userId) {
    this.validateId(userId);
    return await UserDAO.getUser(userId);
  }

  async updateUser(userId, userDto) {
    this.validateId(userId);

    const user = await UserDAO.getUser(userId);

    if (user === undefined)
      throw new NotFoundError("User is not found", { id: userId });

    const validationResult = await validate(
      userDto,
      build()
        .if(
          build().schema({
            email: build()
              .isString()
              .custom(() => (email) => email !== user.email)
          }),
          {
            ifTrue: build().schema({
              email: build()
                .isString()
                .bail()
                .isEmail()
                .not()
                .custom(() => async (email) => {
                  return await UserDAO.isEmailRegisteredForAnotherUser(
                    user.id,
                    email
                  );
                })
                .withMessage("email already registered"),
              password_hash: build().isString().bail().trim().isHash("sha256")
            })
          }
        )
        .schema({
          email: build().optional(),
          password_hash: build()
            .optional()
            .isString()
            .bail()
            .trim()
            .isHash("sha256"),
          is_admin: build().optional().isBoolean(),
          first_name: build()
            .optional()
            .isString()
            .bail()
            .trim()
            .isLength({ min: 2 }),
          last_name: build()
            .optional()
            .isString()
            .bail()
            .trim()
            .isLength({ min: 2 })
        })
    );

    if (validationResult.failed) throw new ValidationError(validationResult);

    const { validated } = validationResult;

    if (validated.password_hash !== undefined) {
      if (validated.email !== undefined)
        user.hash = getUserHash(validated.email, validated.password_hash);
      else user.hash = getUserHash(user.email, validated.password_hash);
    }

    Object.assign(user, validated);

    return await UserDAO.updateUser(user.id, user);
  }

  async deleteUser(userId) {
    this.validateId(userId);

    const res = await UserDAO.deleteUser(userId);
    if (res > 0) await BlacklistedUserIdDAO.blacklistUserId(userId);
    return res;
  }

  async isExist(userId) {
    this.validateId(userId);

    return await UserDAO.isExist(userId);
  }
}

module.exports = new UserService();
