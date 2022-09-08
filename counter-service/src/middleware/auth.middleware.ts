import { Handler } from "express";
import jwt from "jsonwebtoken";
import AuthorizationError from "../errors/authorization.error";
import authService from "../service/auth.service";
import userService from "../service/user.service";

export interface AuthMiddlewareOptions {
  onlyCheckAccessToken: boolean;
}

export class DefaultAuthMiddlewareOptions implements AuthMiddlewareOptions {
  onlyCheckAccessToken = false;
}

export const auth =
  (options = new DefaultAuthMiddlewareOptions()): Handler =>
  async (req, res, next) => {
    try {
      const authorizationHeader = req.headers["authorization"];
      if (
        typeof authorizationHeader !== "string" ||
        !authorizationHeader.startsWith("Brearer ")
      )
        throw new AuthorizationError(
          "Authorization header is required to be bearer access token"
        );

      const accessToken = authorizationHeader.replace("Bearer ", "");

      if (!(await authService.isAccessTokenValid(accessToken)))
        throw new AuthorizationError();

      const authUserData: AuthUserData = jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET
      ) as AuthUserData;

      let user: User = undefined;
      if (!options.onlyCheckAccessToken) {
        user = await userService.getUserByUserAuthId(authUserData.id);
        if (user === undefined)
          throw new AuthorizationError(
            "Authorized user is not registered in counter service"
          );
      }

      req.user = {
        auth: authUserData,
        ...user
      };
    } catch (e) {
      next(e);
    }

    next();
  };
