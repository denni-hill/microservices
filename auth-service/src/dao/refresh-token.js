const db = require("../database/knex");
const InternalServerError = require("../errors/internal.error");

class RefreshTokenDAO {
  async createRefreshToken(userId, refreshToken) {
    try {
      return (
        await db("refresh_tokens")
          .insert({
            user_id: userId,
            refresh_token: refreshToken
          })
          .returning("*")
      )[0];
    } catch (e) {
      throw new InternalServerError(
        "Could not create refresh token in database",
        e
      );
    }
  }

  async getRefreshToken(refreshToken) {
    try {
      return (
        await db("refresh_tokens")
          .select("*")
          .where({ refresh_token: refreshToken })
      )[0];
    } catch (e) {
      throw new InternalServerError(
        "Could not get refresh token in database",
        e
      );
    }
  }

  async deleteRefreshToken(refreshToken) {
    try {
      await db("refresh_tokens")
        .where({ refresh_token: refreshToken })
        .delete();
    } catch (e) {
      throw new InternalServerError(
        "Could not delete refresh token in database",
        e
      );
    }
  }
}

module.exports = new RefreshTokenDAO();
