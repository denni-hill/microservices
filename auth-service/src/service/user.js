const { build, validate } = require("chain-validator-js");
const UserDAO = require("../dao/user");
const PayloadedError = require("../payloaded-error");
const getUserHash = require("./get-user-hash");

class UserService {
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

    if (validationResult.failed)
      throw new PayloadedError("Validation failed", validationResult.errors);

    const userData = { ...validationResult.validated };

    userData.hash = getUserHash(userData.email, userData.password_hash);

    return await UserDAO.createUser(userData);
  }

  async getUser(userId) {
    const validationResult = await validate(userId, build().isInt());
    if (validationResult.failed)
      throw new PayloadedError("Validation failed", validationResult.errors);
    return await UserDAO.getUser(userId);
  }

  async updateUser(userId, userDto) {
    const user = await UserDAO.getUser(userId);

    if (user === undefined)
      throw new PayloadedError("User is not found", { id: userId });

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

    if (validationResult.failed)
      throw new PayloadedError("Validation failed", validationResult.errors);

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
    return await UserDAO.deleteUser(userId);
  }
}

module.exports = new UserService();
