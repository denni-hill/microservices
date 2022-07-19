const UserController = require("../controllers/user.controller");
const auth = require("../middleware/auth.middleware");
const router = require("express").Router();
const { json } = require("body-parser");

router.patch(
  "/",
  auth,
  (req, res, next) => {
    req.params.userId = req.user.id;
    next();
  },
  json(),
  UserController.update
);

router.delete(
  "/",
  auth,
  (req, res, next) => {
    req.params.userId = req.user.id;
    next();
  },
  UserController.delete
);

module.exports = router;
