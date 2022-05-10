const AuthService = require("../service/auth");

class AuthController {
  async login(req, res, next) {
    try {
      const { accessToken, refreshToken } = await AuthService.login(req.body);
      return res.status(200).json({ accessToken, refreshToken });
    } catch (e) {
      if (e.message === "Validation failed") res.status(400).json(e.payload);
      else if (e.message === "User is not found")
        res.status(401).send(e.message);
      else res.status(500).send();

      next(e);
    }
  }

  async refresh(req, res, next) {
    const authHeader = req.headers["authorization"];
    if (typeof authHeader !== "string" && !authHeader.startsWith("Bearer ")) {
      return res.status(401).send("Authorization header is not provided");
    }
    const oldAccessToken = authHeader.replace("Bearer ", "");

    try {
      const { accessToken, refreshToken } = await AuthService.refresh(
        oldAccessToken,
        req.body
      );
      return res.status(200).json({ accessToken, refreshToken });
    } catch (e) {
      if (
        [
          "Access token is invalid",
          "Refresh token is invalid",
          "Refresh token is not found"
        ].includes(e.message)
      )
        res.status(401).send(e.message);
      else res.status(500).send();

      next(e);
    }
  }

  async logout(req, res, next) {
    if (req.user === undefined) return res.status(401).send("Unauthorized");

    try {
      await AuthService.logout(req.user.accessToken, req.body);
      return res.status(200).send();
    } catch (e) {
      if (
        ["Access token is invalid", "Refresh token is invalid"].includes(
          e.message
        )
      )
        res.status(401).send(e.message);
      else res.status(500).send();

      next(e);
    }
  }

  async checkAccessToken(req, res, next) {
    try {
      if (await AuthService.isAccessTokenBlacklisted(req.body))
        res.status(401).json(false);
      else res.status(200).json(true);
    } catch (e) {
      if (e.message === "Access token is invalid") res.status(401).json(false);
      else res.status(500).send();

      next(e);
    }
  }
}

module.exports = new AuthController();
