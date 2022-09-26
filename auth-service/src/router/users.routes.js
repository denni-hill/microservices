const UserController = require("../controllers/user.controller");
const auth = require("../middleware/auth.middleware");
const isAdmin = require("../middleware/is-admin.middleware");
const router = require("express").Router();
const { json } = require("body-parser");
const ForbiddenError = require("../errors/forbidden.error");

router.post(
  "/register",
  (req, res, next) => {
    if (process.env.REGISTRATION_ENABLED === "true") next();
    else new ForbiddenError("Registration is disabled");
  },
  json(),
  UserController.create
);

router.post("/", auth, isAdmin, json(), UserController.create);

router.get("/:userId", auth, isAdmin, UserController.get);

router.patch("/:userId", auth, isAdmin, json(), UserController.update);

router.delete("/:userId", auth, isAdmin, UserController.delete);

router.get("/is-exist/:userId", auth, isAdmin, UserController.isExist);

module.exports = router;
