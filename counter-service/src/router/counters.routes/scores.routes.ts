import { json } from "body-parser";
import { Handler, Router } from "express";
import counterScoreController from "../../controllers/counter-score.controller";
import AuthorizationError from "../../errors/authorization.error";
import ForbiddenError from "../../errors/forbidden.error";
import { auth } from "../../middleware/auth.middleware";
import { isCounterParticipant } from "../../middleware/is-counter-participant.middleware";
import counterScoreService from "../../service/counter-score.service";

const canEditScore: { (counterScoreIdParamKey: string): Handler } =
  (counterScoreIdParamKey) => async (req, res, next) => {
    try {
      if (req.user === undefined) throw new AuthorizationError();
      if (
        req.user.isAdmin !== true ||
        !(await counterScoreService.isScoreAuthor(
          Number(req.params[counterScoreIdParamKey]),
          req.user.id
        ))
      )
        throw new ForbiddenError();
    } catch (e) {
      next(e);
    }
  };

const router = Router();

router.post(
  "/:counterId",
  auth(),
  json(),
  isCounterParticipant("counterId"),
  (req, _res, next) => {
    req.body.counter = Number(req.params["counterId"]);
    next();
  },
  counterScoreController.createScore
);

router.put(
  "/:counterId/:scoreId",
  auth(),
  json(),
  isCounterParticipant("counterId"),
  canEditScore("scoreId"),
  counterScoreController.updateScore("scoreId")
);

router.delete(
  "/:counterId/:scoreId",
  auth(),
  isCounterParticipant("counterId"),
  canEditScore("scoreId"),
  counterScoreController.deleteScore("scoreId")
);

export default router;
