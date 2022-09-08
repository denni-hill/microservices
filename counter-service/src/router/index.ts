import { Router } from "express";
import usersRoutes from "./users.routes";
import profileRoutes from "./profile.routes";
import countersRoutes from "./counters.routes";

const router = Router();
router.use("/users", usersRoutes);
router.use("/profile", profileRoutes);
router.use("/counters", countersRoutes);

export default router;
