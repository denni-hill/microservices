const redisClient = require("../redis");
const jwt = require("jsonwebtoken");
const PayloadedError = require("../payloaded-error");

const blacklistedTokensPrefix = "blacklisted_access_token_";

class BlacklistedAccessTokenDAO {
  async blackistToken(accessToken, iat, exp) {
    if (typeof accessToken !== "string")
      throw new PayloadedError("Access token must be type of string", {
        accessToken
      });

    if (isNaN(Number(iat)))
      throw new PayloadedError("Token issued at must be type of number", {
        iat
      });

    if (isNaN(Number(exp)))
      throw new PayloadedError("Token expiration must be type of number", {
        exp
      });

    if (exp - iat <= 0)
      throw new PayloadedError("Token is expired - no need to blacklist", {
        exp,
        iat
      });

    await redisClient.SETEX(
      `${blacklistedTokensPrefix}${accessToken}`,
      exp - iat,
      "true"
    );
  }

  async isTokenBlacklisted(accessToken) {
    const data = await redisClient.GET(
      `${blacklistedTokensPrefix}${accessToken}`
    );

    return data === "true";
  }
}

module.exports = new BlacklistedAccessTokenDAO();
