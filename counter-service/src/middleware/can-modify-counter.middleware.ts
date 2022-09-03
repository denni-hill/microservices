import { Handler } from "express";
import counterDAO from "../dao/counter.dao";
import AuthorizationError from "../errors/authorization.error";
import ForbiddenError from "../errors/forbidden.error";

export const canModifyCounter: Handler = async (req, res, next) => {
  try {
    if (req.user === undefined) throw new AuthorizationError();
    if (
      req.user.isAdmin !== true ||
      !(await counterDAO.isCounterOwner(
        Number(req.user.id),
        Number(req.params.counterId)
      ))
    )
      throw new ForbiddenError("You don't have rights to access this counter");
    return next();
  } catch (e) {
    next(e);
  }
};
