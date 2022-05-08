const UserDAO = require("../dao/user");
const RefreshTokenDAO = require("../dao/refresh-token");
const BlacklistedAccessTokenDAO = require("../dao/blacklisted-access-token");
const PayloadedError = require("../payloaded-error");
const jwt = require("jsonwebtoken");
const { validate, build } = require("chain-validator-js");
const getUserHash = require("./get-user-hash");

function getTokensPair(user) {
  if (user === undefined)
    throw new PayloadedError("User is undefined", { user });

  const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_TTL,
    issuer: `${process.env.DOMAIN}`
  });

  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
    issuer: `${process.env.DOMAIN}`
  });

  return { accessToken, refreshToken };
}

class AuthService {
  async login({ email, password_hash }) {
    const validationResult = await validate(
      { email, password_hash },
      build().schema({
        email: build().isString().bail().isEmail(),
        password_hash: build().isString().bail().isHash("sha256")
      })
    );
    if (validationResult.failed)
      throw new PayloadedError("Validation failed", validationResult.errors);

    const user = await UserDAO.getUserByHash(getUserHash(email, password_hash));
    if (user === undefined)
      throw new PayloadedError("User is not found", { email, password_hash });

    const { accessToken, refreshToken } = getTokensPair(user);

    await RefreshTokenDAO.createRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  }

  async refresh(accessToken, refreshToken) {
    let token;
    try {
      token = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

      await BlacklistedAccessTokenDAO.blackistToken(
        accessToken,
        token.iat,
        token.exp
      );
    } catch (e) {
      if (e.message !== "jwt expired")
        throw new PayloadedError("Access token is invalid", { accessToken });
    }

    try {
      jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch {
      throw new PayloadedError("Refresh token is invalid", { refreshToken });
    }

    const user = await UserDAO.getUserByRefreshToken(refreshToken);

    if (user === undefined)
      throw new PayloadedError("Refresh token is not found", { refreshToken });

    await RefreshTokenDAO.deleteRefreshToken(refreshToken);

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      getTokensPair(user);

    await RefreshTokenDAO.createRefreshToken(user.id, newRefreshToken);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async logout(accessToken, refreshToken) {
    let token;

    try {
      token = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
      await BlacklistedAccessTokenDAO.blackistToken(
        accessToken,
        token.iat,
        token.exp
      );
    } catch {
      throw new PayloadedError("Access token is invalid", { accessToken });
    }

    try {
      jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      await RefreshTokenDAO.deleteRefreshToken(refreshToken);
    } catch {
      throw new PayloadedError("Refresh token is invalid", { refreshToken });
    }
  }

  async isAccessTokenBlacklisted(accessToken) {
    try {
      jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    } catch {
      throw new PayloadedError("Access token is invalid", { accessToken });
    }

    return await BlacklistedAccessTokenDAO.isTokenBlacklisted(accessToken);
  }
}

module.exports = new AuthService();
