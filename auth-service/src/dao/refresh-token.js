const db = require("../database/knex");

class RefreshTokenDAO {
  async createRefreshToken(userId, refreshToken) {
    return (
      await db("refresh_tokens")
        .insert({
          user_id: userId,
          refresh_token: refreshToken
        })
        .returning("*")
    )[0];
  }

  async getRefreshToken(refreshToken) {
    return (
      await db("refresh_tokens")
        .select("*")
        .where({ refresh_token: refreshToken })
    )[0];
  }

  async deleteRefreshToken(refreshToken) {
    await db("refresh_tokens").where({ refresh_token: refreshToken }).delete();
  }
}

module.exports = new RefreshTokenDAO();
