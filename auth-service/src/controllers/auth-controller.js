const PayloadedError = require("../payloaded-error");
const AuthService = require("../service/auth");

class AuthController {
  async login(req, res) {
    try {
      const { accessToken, refreshToken } = await AuthService.login(req.body);
      return res.status(200).json({ accessToken, refreshToken });
    } catch (e) {
      if (e.message === "Validation failed") res.status(400).json(e.payload);
      else if (e.message === "User is not found") res.status(401).send();
      else res.status(500).send();

      throw e;
    }
  }

  async refresh(req, res) {
    const authHeader = req.headers["authorization"];
    if (typeof authHeader !== "string" && !authHeader.startsWith("Bearer "))
      res.status(401).send();
    const authToken = authHeader.replace("Bearer ", "");

    try {
      const { accessToken, refreshToken } = await AuthService.refresh(
        authToken,
        req.body
      );
      return res.status(200).json({ accessToken, refreshToken });
    } catch (e) {
      if (e.message === "Access token is invalid") res.status(401).send();
      else if (e.message === "Refresh token is invalid") res.status(401).send();
      else if (e.message === "Refresh token is not found")
        res.status(401).send();
      else res.status(500).send();

      throw e;
    }
  }

  async logout(req, res) {
    const authHeader = req.headers["authorization"];
    if (typeof authHeader !== "string" && !authHeader.startsWith("Bearer ")) {
      res.status(401).send();
      throw new PayloadedError("Auth header is not provided");
    }
    const authToken = authHeader.replace("Bearer ", "");

    try {
      await AuthService.logout(authToken, req.body);
      return res.status(200).send();
    } catch (e) {
      if (e.message === "Access token is invalid") res.status(401).send();
      else if (e.message === "Refresh token is invalid") res.status(401).send();
      else res.status(500).send();

      throw e;
    }
  }

  async checkAccessToken(req, res) {
    try {
      if (await AuthService.isAccessTokenBlacklisted(req.body))
        res.status(401).json(false);
      else res.status(200).json(true);
    } catch (e) {
      if (e.message === "Access token is invalid") res.status(401).json(false);
      else res.status(500).send();

      throw e;
    }
  }
}

module.exports = new AuthController();
