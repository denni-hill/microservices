const AuthService = require("../service/auth.service");
const jwt = require("jsonwebtoken");
const AuthorizationError = require("../errors/authorization.error");

async function auth(req, res, next) {
  try {
    const authorizationHeader = req.headers["authorization"];
    if (
      typeof authorizationHeader !== "string" ||
      !authorizationHeader.startsWith("Bearer ")
    )
      throw new AuthorizationError(
        "Authorization header is required to be bearer access token"
      );

    const accessToken = authorizationHeader.replace("Bearer ", "");

    if (!(await AuthService.isAccessTokenValid(accessToken))) {
      throw new AuthorizationError(
        "Access token is blacklisted or/and user was deleted"
      );
    }

    let user;
    try {
      user = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    } catch {
      throw new AuthorizationError("Access token is invalid");
    }

    req.user = { ...user, accessToken };
  } catch (e) {
    next(e);
  }

  next();
}

module.exports = auth;
