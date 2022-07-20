import { Handler } from "express";
import jwt from "jsonwebtoken";
import authService from "../service/auth.service";
import userService from "../service/user.service";

export const auth: Handler = async (req, res, next) => {
  const authorizationHeader = req.headers["authorization"];
  if (
    typeof authorizationHeader !== "string" ||
    !authorizationHeader.startsWith("Brearer ")
  )
    res
      .status(401)
      .send("Authorization header is required to be bearer access token");

  const accessToken = authorizationHeader.replace("Bearer ", "");
  let authUserData: AuthUserData;
  try {
    authUserData = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    ) as AuthUserData;
  } catch {
    return res.status(401).send("Access token is invalid");
  }

  if (!(await authService.isAccessTokenValid(accessToken)))
    res.status(401).send();

  const user = await userService.getUserByUserAuthId(authUserData.id);
  if (user === undefined)
    res
      .status(401)
      .send("Authorized user is not registered in counter service");

  req.user = {
    auth: authUserData,
    ...user
  };

  next();
};
