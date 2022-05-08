const UserController = require("../controllers/user-controller");
const auth = require("../middlewares/auth.middleware");
const isAdmin = require("../middlewares/is-admin.middleware");
const router = require("express").Router();
const { json } = require("body-parser");

router.post(
  "/register",
  (req, res, next) => {
    if (process.env.REGISTRATION_ENABLED === "true") next();
    else res.status(403).send();
  },
  json(),
  UserController.create
);

router.post("/create", auth, isAdmin, json(), UserController.create);

router.route("/:userId", auth, isAdmin, UserController.get);

router.patch("/:userId", auth, isAdmin, json(), UserController.update);

router.delete("/:userId", auth, isAdmin, UserController.delete);

module.exports = router;
