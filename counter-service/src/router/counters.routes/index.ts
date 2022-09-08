import { Router } from "express";
import counterController from "../../controllers/counter.controller";
import { auth } from "../../middleware/auth.middleware";
import { canModifyCounter } from "../../middleware/can-modify-counter.middleware";
import { isCounterParticipant } from "../../middleware/is-counter-participant.middleware";

import scoresRoutes from "./scores.routes";
import invitesRoutes from "./invites.routes";
import { json } from "body-parser";

const router = Router();

router.post(
  "/",
  auth(),
  json(),
  (req, _res, next) => {
    req.body.owner = req.user.id;
    next();
  },
  counterController.createCounter
);

router.put(
  "/:counterId",
  auth(),
  json(),
  canModifyCounter("counterId"),
  counterController.updateCounter("counterId")
);

router.get(
  "/:counterId",
  auth(),
  json(),
  isCounterParticipant("counterId"),
  counterController.getCounter("counterId")
);

router.delete(
  "/:counterId",
  auth(),
  json(),
  canModifyCounter("counterId"),
  counterController.deleteCounter("counterId")
);

router.use("/scores", scoresRoutes);
router.use("/invites", invitesRoutes);

export default router;
