import { Handler } from "express";
import AuthorizationError from "../errors/authorization.error";
import ForbiddenError from "../errors/forbidden.error";
import counterService from "../service/counter.service";

export const isCounterParticipant: { (counterIdParamKey: string): Handler } =
  (counterIdParamKey: string) => async (req, res, next) => {
    try {
      if (req.user === undefined) throw new AuthorizationError();

      if (
        req.user.auth.is_admin !== true &&
        !(await counterService.isUserCounterParticipant(
          req.user.id,
          Number(req.params[counterIdParamKey])
        ))
      )
        throw new ForbiddenError("You are not a counter participant", {
          user: req.user,
          counterId: Number(req.params[counterIdParamKey])
        });
    } catch (e) {
      return next(e);
    }
    next();
  };
