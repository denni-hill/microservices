import { CounterInvite } from "../database/entities/counter-invite.entity";
import BaseService from "./base.service";

import counterDAO from "../dao/counter.dao";
import userDAO from "../dao/user.dao";
import counterInviteDAO from "../dao/counter-invite.dao";
import { build, validate } from "chain-validator-js";
import ValidationError from "../errors/validation.error";
import NotFoundError from "../errors/not-found.error";
import { Id } from "../dao/id";

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

    const [counter, user] = await Promise.all([
      counterDAO.findOne(counterId).then((counter) => {
        if (counter === undefined)
          throw new NotFoundError({ id: counterId }, "Counter");
        return counter[0];
      }),
      userDAO.findByNicknameDigits(nickname, digits).then((toUser) => {
        if (toUser === undefined)
          throw new NotFoundError({ toUserNicknameDigits }, "User-reciever");
        return toUser;
      })
    ]);

    return await counterInviteDAO.create({
      counter,
      user: user
    });
  }

  async deleteInvite(inviteId: Id) {
    await BaseService.validateId(inviteId);

    if (!(await counterInviteDAO.isExist(inviteId)))
      throw new NotFoundError({ id: inviteId }, "Invite");

    return await counterInviteDAO.delete(inviteId);
  }
}

export default new CounterInviteService();
