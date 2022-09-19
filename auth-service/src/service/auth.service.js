const UserDAO = require("../dao/user");
const RefreshTokenDAO = require("../dao/refresh-token");
const BlacklistedAccessTokenDAO = require("../dao/blacklisted-access-token");
const BlacklistedUserIdDAO = require("../dao/blacklisted-user-id");
const ValidationError = require("../errors/validation.error");
const NotFoundError = require("../errors/not-found.error");
const InternalServerError = require("../errors/internal.error");
const jwt = require("jsonwebtoken");
const { validate, build } = require("chain-validator-js");
const getUserHash = require("./get-user-hash");
const { v4: uuid } = require("uuid");
const BaseService = require("./base.service");
const AuthorizationError = require("../errors/authorization.error");

function getTokensPair(user) {
  if (user === undefined) throw new InternalServerError("User is undefined");

  const userData = { ...user };
  delete userData.hash;
  delete userData.created_at;
  delete userData.updated_at;

  const accessToken = jwt.sign(
    { ...userData, token_uuid: uuid() },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_TTL * 1000,
      issuer: `${process.env.DOMAIN}`
    }
  );

  const refreshToken = jwt.sign(
    { id: userData.id, token_uuid: uuid() },
    process.env.REFRESH_TOKEN_SECRET,
    {
      issuer: `${process.env.DOMAIN}`
    }
  );

  return { accessToken, refreshToken };
}

class AuthService extends BaseService {
  async login({ email, password_hash }) {
    const validationResult = await validate(
      { email, password_hash },
      build().schema({
        email: build().isString().bail().isEmail(),
        password_hash: build().isString().bail().isHash("sha256")
      })
    );

    if (validationResult.failed) throw new ValidationError(validationResult);

    const user = await UserDAO.getUserByHash(getUserHash(email, password_hash));

    if (user === undefined)
      throw new AuthorizationError("Wrong credentials provided");

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
      if (e instanceof jwt.TokenExpiredError) accessTokenIsExpired = true;
      else throw new InternalServerError("Access token is invalid", e);
    }

    try {
      jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (e) {
      throw new InternalServerError("Refresh token is invalid", e);
    }

    const user = await UserDAO.getUserByRefreshToken(refreshToken);

    if (user === undefined)
      throw new NotFoundError({ refreshToken }, "Refresh token");

    await RefreshTokenDAO.deleteRefreshToken(refreshToken);
    if (!accessTokenIsExpired)
      await BlacklistedAccessTokenDAO.blacklistToken(
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
    } catch (e) {
      throw new InternalServerError("Access token is invalid", e);
    }

    await BlacklistedAccessTokenDAO.blacklistToken(
      accessToken,
      token.iat,
      token.exp
    );

    try {
      jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (e) {
      throw new InternalServerError("Refresh token is invalid", e);
    }

    await RefreshTokenDAO.deleteRefreshToken(refreshToken);
  }

  async isAccessTokenBlacklisted(accessToken) {
    try {
      jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    } catch (e) {
      throw new InternalServerError("Access token is invalid", e);
    }

    return await BlacklistedAccessTokenDAO.isTokenBlacklisted(accessToken);
  }

  async blacklistUserId(userId) {
    await this.validateId(userId);

    return await BlacklistedUserIdDAO.blacklistUserId(userId);
  }

  async isUserIdBlacklisted(userId) {
    await this.validateId(userId);

    return await BlacklistedUserIdDAO.isUserIdBlacklisted(userId);
  }

  async isAccessTokenValid(accessToken) {
    let user;
    try {
      user = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    } catch (e) {
      throw new InternalServerError("Access token is invalid", e);
    }

    if (user.isInternalServiceToken === true) return true;

    let conditions = await Promise.all([
      this.isAccessTokenBlacklisted(accessToken),
      this.isUserIdBlacklisted(user.id)
    ]);

    if (conditions.some((cond) => cond)) return false;

    return true;
  }
}

module.exports = new AuthService();
