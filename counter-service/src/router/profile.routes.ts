import { Handler, Router } from "express";
import userController from "../controllers/user.controller";
import { auth } from "../middleware/auth.middleware";

const router = Router();

const userIdMocker: Handler = (req, res, next) => {
  req.params.userId = req.user.id.toString();
  next();
};

router.get("/", auth(), userIdMocker, userController.getUser);

router.delete("/", auth(), userIdMocker, userController.deleteUser);

router.patch("/", auth(), userIdMocker, userController.updateUser);

export default router;
