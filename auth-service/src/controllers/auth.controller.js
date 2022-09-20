const AuthService = require("../service/auth.service");
const AuthorizationError = require("../errors/authorization.error");
const logger = require("../logger");

class AuthController {
  async login(req, res, next) {
    try {
      const { accessToken, refreshToken } = await AuthService.login(req.body);
      logger.info("User successfull authorization", {
        email: req.body.email
      });
      return res.status(200).json({ accessToken, refreshToken });
    } catch (e) {
      next(e);
    }
  }

  async refresh(req, res, next) {
    try {
      const authHeader = req.headers["authorization"];
      if (typeof authHeader !== "string" && !authHeader.startsWith("Bearer ")) {
        throw new AuthorizationError("Authorization header is not provided");
      }
      const oldAccessToken = authHeader.replace("Bearer ", "");

      const { accessToken, refreshToken } = await AuthService.refresh(
        oldAccessToken,
        req.body
      );
      logger.info("User access token refreshed");
      return res.status(200).json({ accessToken, refreshToken });
    } catch (e) {
      next(e);
    }
  }

  async logout(req, res, next) {
    try {
      if (req.user === undefined) throw new AuthorizationError();

      await AuthService.logout(req.user.accessToken, req.body);
      logger.info("User logged out");
      return res.status(200).send();
    } catch (e) {
      next(e);
    }
  }

  async checkAccessToken(req, res, next) {
    try {
      const result = await AuthService.isAccessTokenValid(req.body);
      res.status(200).json(result);
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new AuthController();
