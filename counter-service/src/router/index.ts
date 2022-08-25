import { Router } from "express";
import usersRoutes from "./users.routes";
import profileRoutes from "./profile.routes";

const router = Router();
router.use("/users", usersRoutes);
router.use("/profile", profileRoutes);

export default router;
