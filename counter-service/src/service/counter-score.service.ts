import { build, validate } from "chain-validator-js";
import counterParticipantDAO from "../dao/counter-participant.dao";
import counterScoreDAO from "../dao/counter-score.dao";
import counterDAO from "../dao/counter.dao";
import { DeepPartial } from "../dao/deep-partial";
import { Id } from "../dao/id";
import userDAO from "../dao/user.dao";
import { CounterScore } from "../database/entities/counter-score.entity";
import ValidationError from "../errors/validation.error";

const scoreUserValidationRules = () =>
  build()
    .isInt()
    .custom(() => (id: Id) => userDAO.isExist(id))
    .withMessage("User is not found")
    .custom(
      (ctx) => (userId: number) =>
        counterParticipantDAO.isExistByCounterIdUserId(
          ctx.objectToValidate.counter,
          userId
        )
    )
    .withMessage("Counter participant is not found")
    .customSanitizer(() => async () => userDAO.findOne);

const scoreNoteValidationRules = () =>
  build().isString().bail().isLength({ min: 0, max: 500 });

const counterScoreValidationRules = () =>
  build().schema<CounterScore>({
    counter: build()
      .isInt()
      .custom(() => (id: Id) => counterDAO.isExist(id))
      .withMessage("Counter is not found!")
      .customSanitizer(() => (id: Id) => counterDAO.findOne(id)),
    from: scoreUserValidationRules(),
    to: scoreUserValidationRules(),
    note: scoreNoteValidationRules()
  });

class CounterScoreService {
  async createScore(
    scoreDTO: DeepPartial<CounterScore>
  ): Promise<CounterScore> {
    const validationResult = await validate(
      scoreDTO,
      counterScoreValidationRules()
    );

    if (validationResult.failed) throw new ValidationError(validationResult);

    return await counterScoreDAO.create(validationResult.validated);
  }

  async updateScoreNote(scoreId: Id, note: string): Promise<CounterScore> {
    const validationResult = await validate(note, scoreNoteValidationRules());

    if (validationResult.failed) throw new ValidationError(validationResult);

    return await counterScoreDAO.update(scoreId, { note }, { notFound: true });
  }

  async deleteScore(scoreId: Id): Promise<number> {
    return await counterScoreDAO.delete(scoreId, { notFound: true });
  }

  async doesUserHaveScores(userId: Id): Promise<boolean> {
    return (await counterScoreDAO.getUserScoresCount(userId)) > 0;
  }

  async isScoreAuthor(scoreId: Id, userId: Id): Promise<boolean> {
    return await counterScoreDAO.isScoreAuthor(scoreId, userId);
  }
}

export default new CounterScoreService();
