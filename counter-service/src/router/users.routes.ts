import { Router } from "express";
import userController from "../controllers/user.controller";
import { auth } from "../middleware/auth.middleware";
import { isAdmin } from "../middleware/is-admin.middleware";

const router = Router();

router.post(
  "/",
  auth({ onlyCheckAccessToken: true }),
  userController.createUser
);

router.patch("/:userId", auth(), isAdmin, userController.updateUser);

router.delete("/:userId", auth(), isAdmin, userController.deleteUser);

router.get("/:userId", auth(), isAdmin, userController.getUser);

export default router;
