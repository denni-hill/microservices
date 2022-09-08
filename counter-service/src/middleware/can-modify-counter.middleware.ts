import { Handler } from "express";
import AuthorizationError from "../errors/authorization.error";
import ForbiddenError from "../errors/forbidden.error";
import counterService from "../service/counter.service";

export const canModifyCounter: { (counterIdParamKey: string): Handler } =
  (counterIdParamKey): Handler =>
  async (req, _res, next) => {
    try {
      if (req.user === undefined) throw new AuthorizationError();
      if (
        req.user.isAdmin !== true ||
        !(await counterService.isUserCounterOwner(
          req.user.id,
          Number(req.params[counterIdParamKey])
        ))
      )
        throw new ForbiddenError(
          "You don't have rights to access this counter"
        );
    } catch (e) {
      return next(e);
    }

    next();
  };
