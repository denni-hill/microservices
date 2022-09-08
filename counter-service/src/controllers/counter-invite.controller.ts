import { Handler } from "express";
import counterInviteService from "../service/counter-invite.service";

class CounterInviteController {
  createInvite: { (counterIdParamKey: string): Handler } =
    (counterIdParamKey) => async (req, res, next) => {
      try {
        const invite = await counterInviteService.createInvite(
          Number(req.params[counterIdParamKey]),
          req.body
        );

        res.status(201).json(invite);
      } catch (e) {
        next(e);
      }
    };

  deleteInvite: { (inviteIdParamKey: string): Handler } =
    (inviteIdParamKey) => async (req, res, next) => {
      try {
        await counterInviteService.deleteInvite(
          Number(req.params[inviteIdParamKey])
        );

        res.status(200).send();
      } catch (e) {
        next(e);
      }
    };

  acceptInvite: { (inviteIdParamKey: string): Handler } =
    (inviteIdParamKey) => async (req, res, next) => {
      try {
        const participant = await counterInviteService.acceptInvite(
          Number(req.params[inviteIdParamKey])
        );

        res.status(201).json(participant);
      } catch (e) {
        next(e);
      }
    };
}

export default new CounterInviteController();
