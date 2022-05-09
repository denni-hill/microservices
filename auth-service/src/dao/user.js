const db = require("../database/knex");

class UserDAO {
  async createUser({ email, first_name, last_name, is_admin, hash }) {
    return (
      await db("users")
        .insert({ email, first_name, last_name, is_admin, hash })
        .returning("*")
    )[0];
  }

  async getUser(id) {
    return (await db("users").select("*").where({ id }))[0];
  }

  async getUserByHash(hash) {
    return (await db("users").select("*").where({ hash }))[0];
  }

  async getUserByRefreshToken(refreshToken) {
    return (
      await db("refresh_tokens")
        .select("users.*")
        .where({ refresh_token: refreshToken })
        .leftJoin("users", "refresh_tokens.user_id", "users.id")
    )[0];
  }

  async getUserByEmail(email) {
    return (await db("users").select("*").where({ email }))[0];
  }

  async isEmailRegistered(email) {
    return (await db("users").count("*").where({ email }))[0].count > 0;
  }

  async isEmailRegisteredForAnotherUser(id, email) {
    return (
      (await db("users").count("*").where({ email }).whereNot({ id }))[0]
        .count > 0
    );
  }

  async updateUser(id, { email, first_name, last_name, is_admin, hash }) {
    return (
      await db("users")
        .where({ id })
        .update({ email, first_name, last_name, is_admin, hash })
        .returning("*")
    )[0];
  }

  async deleteUser(id) {
    return await db("users").where({ id }).delete();
  }

  async isExist(id) {
    return (await db("users").count("*").where({ id }))[0].count > 0;
  }
}

module.exports = new UserDAO();
