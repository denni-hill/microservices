const authRoutes = require("./auth.routes");
const usersRoutes = require("./users.routes");
const profileRoutes = require("./profile.routes");

const router = require("express").Router();

router.use(authRoutes);
router.use("/users", usersRoutes);
router.use("/profile", profileRoutes);

module.exports = router;
