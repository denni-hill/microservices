const InternalServerError = require("../errors/internal.error");
const redisClient = require("../redis");

const blacklistedUserIdPrefix = "blacklisted_user_id_";

class BlacklistedUserIdDAO {
  async blacklistUserId(id) {
    try {
      await redisClient.SETEX(
        `${blacklistedUserIdPrefix}${id}`,
        process.env.ACCESS_TOKEN_TTL,
        "true"
      );
    } catch (e) {
      throw new InternalServerError("Could not blacklist user id in redis", e);
    }
  }

  async isUserIdBlacklisted(id) {
    try {
      return (
        (await redisClient.GET(`${blacklistedUserIdPrefix}${id}`)) === "true"
      );
    } catch (e) {
      throw new InternalServerError(
        "Could not check if user id blaclisted in redis",
        e
      );
    }
  }
}

module.exports = new BlacklistedUserIdDAO();
