import { Router } from "express";
import counterController from "../controllers/counter.controller";
import { auth } from "../middleware/auth.middleware";
import { canModifyCounter } from "../middleware/can-modify-counter.middleware";

const router = Router();

router.post("/", auth());

router.patch(
  "/:counterId",
  auth(),
  canModifyCounter,
  counterController.updateCounter
);

router.get("/:counterId");
