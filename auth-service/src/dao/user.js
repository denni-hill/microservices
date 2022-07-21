const db = require("../database/knex");
const InternalServerError = require("../errors/internal.error");

class UserDAO {
  async createUser({ email, first_name, last_name, is_admin, hash }) {
    try {
      return (
        await db("users")
          .insert({ email, first_name, last_name, is_admin, hash })
          .returning("*")
      )[0];
    } catch (e) {
      throw new InternalServerError("Could not create user in database", e);
    }
  }

  async getUser(id) {
    try {
      return (await db("users").select("*").where({ id }))[0];
    } catch (e) {
      throw new InternalServerError("Could not get user in database", e);
    }
  }

  async getUserByHash(hash) {
    try {
      return (await db("users").select("*").where({ hash }))[0];
    } catch (e) {
      throw new InternalServerError(
        "Could not get user by hash in database",
        e
      );
    }
  }

  async getUserByRefreshToken(refreshToken) {
    try {
      return (
        await db("refresh_tokens")
          .select("users.*")
          .where({ refresh_token: refreshToken })
          .leftJoin("users", "refresh_tokens.user_id", "users.id")
      )[0];
    } catch (e) {
      throw new InternalServerError(
        "Could not get user by refresh token in database",
        e
      );
    }
  }

  async getUserByEmail(email) {
    try {
      return (await db("users").select("*").where({ email }))[0];
    } catch (e) {
      throw new InternalServerError(
        "Could not get user by email in database",
        e
      );
    }
  }

  async isEmailRegistered(email) {
    try {
      return (await db("users").count("*").where({ email }))[0].count > 0;
    } catch (e) {
      throw new InternalServerError(
        "Could not check is email registered in database",
        e
      );
    }
  }

  async isEmailRegisteredForAnotherUser(id, email) {
    try {
      return (
        (await db("users").count("*").where({ email }).whereNot({ id }))[0]
          .count > 0
      );
    } catch (e) {
      throw new InternalServerError(
        "Could not check is email registered for another user in database",
        e
      );
    }
  }

  async updateUser(id, { email, first_name, last_name, is_admin, hash }) {
    try {
      return (
        await db("users")
          .where({ id })
          .update({ email, first_name, last_name, is_admin, hash })
          .returning("*")
      )[0];
    } catch (e) {
      throw new InternalServerError("Could not update user in database", e);
    }
  }

  async deleteUser(id) {
    try {
      return await db("users").where({ id }).delete();
    } catch (e) {
      throw new InternalServerError("Could not delete user in database", e);
    }
  }

  async isExist(id) {
    try {
      return (await db("users").count("*").where({ id }))[0].count > 0;
    } catch (e) {
      throw new InternalServerError(
        "Could not check if user exists in database",
        e
      );
    }
  }
}

module.exports = new UserDAO();
