const UserDAO = require("../dao/user");
const RefreshTokenDAO = require("../dao/refresh-token");
const BlacklistedAccessTokenDAO = require("../dao/blacklisted-access-token");
const BlacklistedUserIdDAO = require("../dao/blacklisted-user-id");
const PayloadedError = require("../payloaded-error");
const jwt = require("jsonwebtoken");
const { validate, build } = require("chain-validator-js");
const getUserHash = require("./get-user-hash");
const { v4: uuid } = require("uuid");

function getTokensPair(user) {
  if (user === undefined)
    throw new PayloadedError("User is undefined", { user });

  const accessToken = jwt.sign(
    { ...user, token_uuid: uuid() },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_TTL * 1000,
      issuer: `${process.env.DOMAIN}`
    }
  );

  const refreshToken = jwt.sign(
    { ...user, token_uuid: uuid() },
    process.env.REFRESH_TOKEN_SECRET,
    {
      issuer: `${process.env.DOMAIN}`
    }
  );

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
    let accessTokenIsExpired = false;
    try {
      token = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    } catch (e) {
      if (e.message === "jwt expired") accessTokenIsExpired = true;
      else throw new PayloadedError("Access token is invalid", { accessToken });
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
    if (!accessTokenIsExpired)
      await BlacklistedAccessTokenDAO.blackistToken(
        accessToken,
        token.iat,
        token.exp
      );

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      getTokensPair(user);

    await RefreshTokenDAO.createRefreshToken(user.id, newRefreshToken);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async logout(accessToken, refreshToken) {
    let token;

    try {
      token = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    } catch {
      throw new PayloadedError("Access token is invalid", { accessToken });
    }

    await BlacklistedAccessTokenDAO.blackistToken(
      accessToken,
      token.iat,
      token.exp
    );

    try {
      jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch {
      throw new PayloadedError("Refresh token is invalid", { refreshToken });
    }

    await RefreshTokenDAO.deleteRefreshToken(refreshToken);
  }

  async isAccessTokenBlacklisted(accessToken) {
    try {
      jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    } catch {
      throw new PayloadedError("Access token is invalid", { accessToken });
    }

    return await BlacklistedAccessTokenDAO.isTokenBlacklisted(accessToken);
  }

  async blacklistUserId(userId) {
    return await BlacklistedUserIdDAO.blacklistUserId(userId);
  }

  async isUserIdBlacklisted(userId) {
    return await BlacklistedUserIdDAO.isUserIdBlacklisted(userId);
  }

  async isAccessTokenValid(accessToken) {
    let user;
    try {
      user = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    } catch {
      throw new PayloadedError("Access token is invalid!", { accessToken });
    }

    let conditions = await Promise.all([
      this.isAccessTokenBlacklisted(accessToken),
      this.isUserIdBlacklisted(user.id)
    ]);

    if (conditions.some((cond) => cond)) return false;

    return true;
  }
}

module.exports = new AuthService();
