const UserService = require("../service/user");

class UserController {
  async create(req, res) {
    try {
      if (req.user === undefined || req.user.is_admin !== true)
        delete req.body.is_admin;
    } catch {}

    try {
      const user = await UserService.createUser(req.body);
      delete user.hash;
      return res.status(200).json(user);
    } catch (e) {
      if (e.message === "Validation failed") res.status(400).json(e.payload);
      else res.status(500).send();

      throw e;
    }
  }

  async get(req, res) {
    try {
      const user = await UserService.get(req.params.userId);
      if (user === undefined) return res.status(404).send();
      else return res.status(200).json(user);
    } catch (e) {
      if (e.message === "Validation failed") res.status(400).send(e.payload);
      else res.status(500).send();

      throw e;
    }
  }

  async update(req, res) {
    try {
      if (req.user === undefined || req.user.is_admin !== true)
        delete req.body.is_admin;
    } catch {}

    try {
      const user = await UserService.updateUser(req.params.userId, req.body);
      return res.status(200).json(user);
    } catch (e) {
      if (e.message === "User is not found") res.status(403).send();
      else if (e.message === "Validation failed")
        res.status(400).json(e.payload);
      else res.status(500).send();

      throw e;
    }
  }

  async delete(req, res) {
    try {
      const affectedRowsNumber = await UserService.deleteUser(
        req.params.userId
      );
      if (affectedRowsNumber === 0) return res.status(403).send();
      else return res.status(200).send();
    } catch (e) {
      res.status(500).send();

      throw e;
    }
  }
}

module.exports = new UserController();
