import { build, validate } from "chain-validator-js";
import { Handler } from "express";
import { ValidationError } from "../errors/validation.error";

class UserController {
  createUser: Handler = async (req, res, next) => {
    const validationResult = await validate(
      req.body,
      build().schema<User>({
        authUserId: build().isNumeric()
      })
    );

    if (validationResult.failed) next(new ValidationError(validationResult));
  };
}

export default new UserController();
