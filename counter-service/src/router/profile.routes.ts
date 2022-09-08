import { json } from "body-parser";
import { Handler, Router } from "express";
import userController from "../controllers/user.controller";
import { auth } from "../middleware/auth.middleware";

const router = Router();

const userIdMocker: Handler = (req, res, next) => {
  req.params.userId = req.user.id.toString();
  next();
};

router.put(
  "/",
  auth(),
  json(),
  userIdMocker,
  userController.updateUser("userId")
);

router.get("/", auth(), json(), userIdMocker, userController.getUser("userId"));

router.delete(
  "/",
  auth(),
  json(),
  userIdMocker,
  userController.deleteUser("userId")
);

export default router;
