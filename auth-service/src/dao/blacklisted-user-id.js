const redisClient = require("../redis");

const blacklistedUserIdPrefix = "blacklisted_user_id_";

class BlacklistedUserIdDAO {
  async blacklistUserId(id) {
    await redisClient.SETEX(
      `${blacklistedUserIdPrefix}${id}`,
      process.env.ACCESS_TOKEN_TTL,
      "true"
    );
  }

  async isUserIdBlacklisted(id) {
    return (
      (await redisClient.GET(`${blacklistedUserIdPrefix}${id}`)) === "true"
    );
  }
}

module.exports = new BlacklistedUserIdDAO();
