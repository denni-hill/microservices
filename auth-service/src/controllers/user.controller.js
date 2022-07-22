const UserService = require("../service/user.service");
const NotFoundError = require("../errors/not-found.error");

class UserController {
  async create(req, res, next) {
    try {
      const user = await UserService.createUser(req.body);
      delete user.hash;
      return res.status(201).json(user);
    } catch (e) {
      next(e);
    }
  }

  async get(req, res, next) {
    try {
      const user = await UserService.get(req.params.userId);
      if (user === undefined)
        throw new NotFoundError(
          {
            id: req.params.id
          },
          "User"
        );

      return res.status(200).json(user);
    } catch (e) {
      next(e);
    }
  }

  async update(req, res, next) {
    try {
      if (req.user === undefined || req.user.is_admin !== true)
        delete req.body.is_admin;
    } catch {}

    try {
      const user = await UserService.updateUser(req.params.userId, req.body);
      return res.status(200).json(user);
    } catch (e) {
      next(e);
    }
  }

  async delete(req, res, next) {
    try {
      const affectedRowsNumber = await UserService.deleteUser(
        req.params.userId
      );
      if (affectedRowsNumber === 0)
        throw new NotFoundError(
          {
            id: req.params.userId
          },
          "User"
        );
      else return res.status(200).send();
    } catch (e) {
      next(e);
    }
  }

  async isExist(req, res, next) {
    try {
      return res.status(200).json(await UserService.isExist(req.params.userId));
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new UserController();
