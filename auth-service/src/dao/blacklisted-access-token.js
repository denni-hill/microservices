const redisClient = require("../redis");
const jwt = require("jsonwebtoken");
const InternalServerError = require("../errors/internal.error");

const blacklistedTokensPrefix = "blacklisted_access_token_";

class BlacklistedAccessTokenDAO {
  async blacklistToken(accessToken, iat, exp) {
    if (typeof accessToken !== "string")
      throw new InternalServerError("Access token must be type of string", {
        accessToken
      });

    if (isNaN(Number(iat)))
      throw new InternalServerError("Token issued at must be type of number", {
        iat
      });

    if (isNaN(Number(exp)))
      throw new InternalServerError("Token expiration must be type of number", {
        exp
      });

    if (exp - iat <= 0)
      throw new InternalServerError("Token is expired - no need to blacklist", {
        exp,
        iat
      });

    try {
      await redisClient.SETEX(
        `${blacklistedTokensPrefix}${accessToken}`,
        exp - iat,
        "true"
      );
    } catch (e) {
      throw new InternalServerError(
        "Could not blacklist access token in redis",
        e
      );
    }
  }

  async isTokenBlacklisted(accessToken) {
    try {
      const data = await redisClient.GET(
        `${blacklistedTokensPrefix}${accessToken}`
      );

      return data === "true";
    } catch (e) {
      throw new InternalServerError(
        "Could not check if access token blacklisted in redis",
        e
      );
    }
  }
}

module.exports = new BlacklistedAccessTokenDAO();
