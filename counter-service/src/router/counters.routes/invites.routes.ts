import { json } from "body-parser";
import { Router } from "express";
import counterInviteController from "../../controllers/counter-invite.controller";
import ForbiddenError from "../../errors/forbidden.error";
import { auth } from "../../middleware/auth.middleware";
import { canModifyCounter } from "../../middleware/can-modify-counter.middleware";
import counterInviteService from "../../service/counter-invite.service";
import counterService from "../../service/counter.service";

const router = Router();

router.post(
  "/:counterId",
  auth(),
  json(),
  canModifyCounter("counterId"),
  counterInviteController.createInvite("counterId")
);

router.get(
  "/accept/:inviteId",
  auth(),
  async (req, _res, next) => {
    try {
      if (
        req.user.isAdmin !== true &&
        !(await counterInviteService.isInviteOwner(
          Number(req.params.inviteId),
          req.user.id
        ))
      )
        throw new ForbiddenError();
    } catch (e) {
      return next(e);
    }
    next();
  },
  counterInviteController.acceptInvite("inviteId")
);

router.delete(
  "/:counterId/:inviteId",
  auth(),
  async (req, _res, next) => {
    try {
      if (
        req.user.isAdmin !== true &&
        !(await counterInviteService.isInviteOwner(
          Number(req.params.inviteId),
          req.user.id
        )) &&
        !(await counterService.isUserCounterOwner(
          req.user.id,
          Number(req.params.counterId)
        ))
      )
        throw new ForbiddenError();
    } catch (e) {
      return next(e);
    }

    next();
  },
  counterInviteController.deleteInvite("inviteId")
);

export default router;
