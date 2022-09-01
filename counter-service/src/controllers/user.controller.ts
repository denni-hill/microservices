import { build, validate } from "chain-validator-js";
import { Handler } from "express";
import NotFoundError from "../errors/not-found.error";
import ValidationError from "../errors/validation.error";
import logger from "../logger";
import authService from "../service/auth.service";
import userService from "../service/user.service";

class UserController {
  createUser: Handler = async (req, res, next) => {
    try {
      const validationResult = await validate(
        req.body,
        build().schema<User>({
          authUserId: build()
            .isInt()
            .bail()
            .custom(
              () => async (id: number) => await authService.isAuthUserExist(id)
            )
        })
      );

      if (validationResult.failed) throw new ValidationError(validationResult);

      const user = await userService.createUser(req.body);

      logger.info("User created", user);
      res.status(201).json(user);
    } catch (e) {
      next(e);
    }
  };

  updateUser: Handler = async (req, res, next) => {
    try {
      const user = await userService.updateUser(
        Number(req.params.userId),
        req.body
      );

      logger.info("User updated", user);
      res.status(200).json(user);
    } catch (e) {
      next(e);
    }
  };

  getUser: Handler = async (req, res, next) => {
    try {
      const user = await userService.getUser(Number(req.params.userId));

      res.status(200).json(user);
    } catch (e) {
      next(e);
    }
  };

  deleteUser: Handler = async (req, res, next) => {
    try {
      if (await userService.deleteUser(Number(req.params.userId))) {
        logger.info("User deleted", { userId: req.params.id });
        res.status(200).send();
      } else throw new NotFoundError({ id: req.params.userId }, "User");
    } catch (e) {
      next(e);
    }
  };
}

export default new UserController();
