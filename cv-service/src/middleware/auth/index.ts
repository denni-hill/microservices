import { Middleware } from "koa";
import jwt from "jsonwebtoken";
import { AppContext, AppState, PayloadedError } from "../../app-types";
import { build, validate } from "chain-validator-js";
import { User } from "./user";
import { JWTokens } from "../../axios";

export const auth: Middleware<AppState, AppContext> = async (ctx, next) => {
  const authHeader =
    typeof ctx.request.headers.authorization === "string"
      ? ctx.request.headers.authorization
      : "Bearer ";

  const token = authHeader.replace("Bearer ", "");
  let decodedToken: unknown;
  try {
    decodedToken = jwt.verify(token, JWTokens.secret);
  } catch (e) {
    throw new PayloadedError("Unauthorized", { status: 401 });
  }

  const tokenDataValidationResult = await validate(
    decodedToken,
    build().schema({
      sub: build(),
      isAdmin: build().optional().isBoolean(),
      availableResources: build().isArray()
    })
  );

  if (tokenDataValidationResult.failed)
    throw new PayloadedError("Unauthorized", {
      status: 401,
      payload: tokenDataValidationResult.errors
    });

  ctx.user = new User(tokenDataValidationResult.validated);

  next();
};
