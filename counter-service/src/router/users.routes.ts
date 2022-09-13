import { json } from "body-parser";
import { Router } from "express";
import userController from "../controllers/user.controller";
import { auth } from "../middleware/auth.middleware";
import { isAdmin } from "../middleware/is-admin.middleware";

const router = Router();

router.post(
  "/",
  auth({ onlyCheckAccessToken: true }),
  json(),
  isAdmin,
  userController.createUser
);

router.post(
  "/register",
  auth({ onlyCheckAccessToken: true }),
  json(),
  (req, _res, next) => {
    req.body.authUserId = req.user.auth.id;
    delete req.body.isAdmin;
    next();
  },
  userController.createUser
);

router.put(
  "/:userId",
  auth(),
  isAdmin,
  json(),
  userController.updateUser("userId")
);

router.post(
  "/restore/:userId",
  auth(),
  isAdmin,
  userController.restoreUser("userId")
);

router.delete(
  "/:userId",
  auth(),
  isAdmin,
  json(),
  userController.deleteUser("userId")
);

router.get(
  "/:userId",
  auth(),
  isAdmin,
  json(),
  userController.getUser("userId")
);

export default router;
