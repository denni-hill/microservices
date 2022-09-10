const AuthController = require("../controllers/auth.controller");
const auth = require("../middleware/auth.middleware");
const router = require("express").Router();
const { json, text } = require("body-parser");

router.post("/login", json(), AuthController.login);

router.post("/refresh", text(), AuthController.refresh);

router.post("/logout", auth, text(), AuthController.logout);

router.post("/check", auth, (_req, res) => {
  res.status(200).send();
});

router.post("/service-check", auth, text(), AuthController.checkAccessToken);

module.exports = router;
