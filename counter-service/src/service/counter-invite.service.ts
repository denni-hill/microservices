import { CounterInvite } from "../database/entities/counter-invite.entity";
import counterDAO from "../dao/counter.dao";
import userDAO from "../dao/user.dao";
import counterInviteDAO from "../dao/counter-invite.dao";
import { build, validate } from "chain-validator-js";
import ValidationError from "../errors/validation.error";
import { Id } from "../dao/id";
import { CounterParticipant } from "../database/entities/counter-participant.entity";
import counterParticipantDao from "../dao/counter-participant.dao";
import { ConflictError } from "../errors/conflict.error";

class CounterInviteService {
  async createInvite(
    counterId: Id,
    toUserNicknameDigits: string
  ): Promise<CounterInvite> {
    const { nickname, digits } = await this.parseNicknameDigits(
      toUserNicknameDigits
    );

    const [counter, user] = await Promise.all([
      counterDAO.findOne(counterId, { notFound: true }),
      userDAO.findByNicknameDigits(nickname, digits, { notFound: true })
    ]);

    if (
      await counterParticipantDao.isExistByCounterIdUserId(counter.id, user.id)
    )
      throw new ConflictError("User is already participates in this counter");

    return await counterInviteDAO.create({
      counter,
      user
    });
  }

  async acceptInvite(inviteId: Id): Promise<CounterParticipant> {
    return await counterInviteDAO.acceptInvite(inviteId);
  }

  async deleteInvite(inviteId: Id): Promise<number> {
    return await counterInviteDAO.delete(inviteId, { notFound: true });
  }

  async isInviteReciever(inviteId: Id, userId: Id): Promise<boolean> {
    return await counterInviteDAO.isInviteReciever(inviteId, userId);
  }

  async getUserInvites(userId: Id): Promise<CounterInvite[]> {
    return await counterInviteDAO.getUserInvites(userId);
  }

  async getCounterInvites(counterId: Id): Promise<CounterInvite[]> {
    return await counterInviteDAO.getCounterInvites(counterId);
  }

  protected async parseNicknameDigits(
    nicknameDigits: string
  ): Promise<{ nickname: string; digits: number }> {
    const nicknameDigitsStringValidationResult = await validate(
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
    );

    if (nicknameDigitsStringValidationResult.failed)
      throw new ValidationError(nicknameDigitsStringValidationResult);

    const validationResult = await validate(
      nicknameDigitsStringValidationResult.validated,
      build().schema<{ nickname: string; digits: string }>({
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
}

export default new CounterInviteService();
