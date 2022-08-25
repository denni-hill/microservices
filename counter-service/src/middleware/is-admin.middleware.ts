import { Handler } from "express";
import AuthorizationError from "../errors/authorization.error";
import ForbiddenError from "../errors/forbidden.error";

export const isAdmin: Handler = (req, res, next) => {
  try {
    if (req.user === undefined) throw new AuthorizationError();
    if (req.user.isAdmin !== true) throw new ForbiddenError();
  } catch (e) {
    next(e);
  }

  next();
};
