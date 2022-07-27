import { CounterInvite } from "../database/entities/counter-invite";
import BaseService from "./base.service";

import counterDAO from "../dao/counter";
import userDAO from "../dao/user";
import counterInviteDAO from "../dao/counter-invite";
import { build, validate } from "chain-validator-js";
import ValidationError from "../errors/validation.error";
import NotFoundError from "../errors/not-found.error";

async function parseNicknameDigits(
  nicknameDigits: string
): Promise<{ nickname: string; digits: number }> {
  const validationResult = await validate(
    nicknameDigits,
    build()
      .isString()
      .bail()
      .trim()
      .customSanitizer(
        () => async (nicknameDigits: string) => nicknameDigits.split("#")
      )
      .isArrayLength({ min: 2, max: 2 })
      .withMessage("One # is required")
      .bail()
      .customSanitizer(() => async (splittedNicknameDigits: string[]) => ({
        nickname: splittedNicknameDigits[0],
        digits: splittedNicknameDigits[1]
      }))
      .schema<{ nickname: string; digits: string }>({
        nickname: build()
          .isString()
          .bail()
          .trim()
          .isLength({ min: 2, max: 20 }),
        digits: build().isInt({ min: 1000, max: 9999 })
      })
  );

  if (validationResult.failed) throw new ValidationError(validationResult);

  return validationResult.validated;
}

class CounterInviteService {
  async createInvite(
    counterId: number,
    fromUserId: number,
    toUserNicknameDigits: string
  ): Promise<CounterInvite> {
    const { nickname, digits } = await Promise.all([
      parseNicknameDigits(toUserNicknameDigits),
      BaseService.validateId(counterId),
      BaseService.validateId(fromUserId)
    ])[0];

    const [counter, fromUser, toUser] = await Promise.all([
      counterDAO.findOne({ where: { id: counterId } }).then((counter) => {
        if (counter === undefined)
          throw new NotFoundError({ id: counterId }, "Counter");
        return counter;
      }),
      userDAO.findOne({ where: { id: fromUserId } }).then((fromUser) => {
        if (fromUser === undefined)
          throw new NotFoundError({ id: fromUserId }, "User-sender");
        return fromUser;
      }),
      userDAO
        .findOne({
          where: {
            nickname,
            digits
          }
        })
        .then((toUser) => {
          if (toUser === undefined)
            throw new NotFoundError({ toUserNicknameDigits }, "User-reciever");
          return toUser;
        })
    ]);

    return await counterInviteDAO.create({
      counter,
      from: fromUser,
      to: toUser
    });
  }

  async deleteInvite(inviteId: number) {
    await BaseService.validateId(inviteId);

    if (!(await counterInviteDAO.isExist({ where: { id: inviteId } })))
      throw new NotFoundError({ id: inviteId }, "Invite");

    return await counterInviteDAO.delete({ where: { id: inviteId } });
  }
}

export default new CounterInviteService();
