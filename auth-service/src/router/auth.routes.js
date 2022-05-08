const AuthController = require("../controllers/auth-controller");
const auth = require("../middlewares/auth.middleware");
const router = require("express").Router();
const { json, text } = require("body-parser");

router.post("/login", json(), AuthController.login);

router.post("/refresh", text(), AuthController.refresh);

router.post("/logout", auth, text(), AuthController.logout);

router.post("/check", text(), AuthController.checkAccessToken);

module.exports = router;
