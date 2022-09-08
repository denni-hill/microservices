import { Handler } from "express";
import userService from "../service/user.service";

class UserController {
  createUser: Handler = async (req, res, next) => {
    try {
      const user = await userService.createUser(req.body);

      res.status(201).json(user);
    } catch (e) {
      next(e);
    }
  };

  updateUser: { (userIdParamKey: string): Handler } =
    (userIdParamKey) => async (req, res, next) => {
      try {
        const user = await userService.updateUser(
          Number(req.params[userIdParamKey]),
          req.body
        );

        res.status(200).json(user);
      } catch (e) {
        next(e);
      }
    };

  getUser: { (userIdParamKey: string): Handler } =
    (userIdParamKey) => async (req, res, next) => {
      try {
        const user = await userService.getUser(
          Number(req.params[userIdParamKey])
        );

        res.status(200).json(user);
      } catch (e) {
        next(e);
      }
    };

  deleteUser: { (userIdParamKey: string): Handler } =
    (userIdParamKey) => async (req, res, next) => {
      try {
        await userService.deleteUser(Number(req.params[userIdParamKey]));

        res.status(200).send();
      } catch (e) {
        next(e);
      }
    };
}

export default new UserController();
