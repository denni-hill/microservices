import { Handler } from "express";
import AuthorizationError from "../errors/authorization.error";

export const isCounterParticipant: Handler = async (req, res, next) => {
  try {
    if (req.user === undefined) throw new AuthorizationError();
  } catch (e) {
    next(e);
  }
};
