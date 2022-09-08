import { build, validate } from "chain-validator-js";
import { Counter } from "../database/entities/counter.entity";
import ValidationError from "../errors/validation.error";
import counterDAO from "../dao/counter.dao";
import userService from "./user.service";
import userDAO from "../dao/user.dao";
import counterParticipantDAO from "../dao/counter-participant.dao";
import { Id } from "../dao/id";

const CounterDTOValidationRules = () =>
  build().schema<Counter>({
    name: build().isString().bail().trim().isLength({ min: 2, max: 128 }),
    description: build()
      .isString()
      .bail()
      .trim()
      .isLength({ min: 0, max: 1024 }),
    owner: build()
      .isInt()
      .bail()
      .customSanitizer(() => userService.getUser)
  });

class CounterService {
  async createCounter(counterDTO: Partial<Counter>): Promise<Counter> {
    const validationResult = await validate(
      counterDTO,
      CounterDTOValidationRules()
    );

    if (validationResult.failed) throw new ValidationError(validationResult);

    return await counterDAO.create({
      ...validationResult.validated,
      participants: [validationResult.validated.owner]
    });
  }

  async updateCounter(
    counterId: Id,
    counterDTO: Partial<Counter>
  ): Promise<Counter> {
    const validationResult = await validate(
      counterDTO,
      CounterDTOValidationRules()
    );
    await counterDAO.findOne(counterId, { notFound: true });

    if (validationResult.failed) throw new ValidationError(validationResult);

    return await counterDAO.update(counterId, validationResult.validated, {
      notFound: true
    });
  }

  async deleteCounter(counterId: Id): Promise<number> {
    await counterDAO.findOne(counterId, { notFound: true });

    return await counterDAO.delete(counterId, { notFound: true });
  }

  async getCounter(counterId: Id): Promise<Counter> {
    return await counterDAO.findOne(counterId, { notFound: true });
  }

  async isUserCounterOwner(userId: Id, counterId: Id): Promise<boolean> {
    return counterDAO.isCounterOwner(userId, counterId);
  }

  async addParticipant(counterId: Id, userId: Id) {
    const [counter, user] = await Promise.all([
      counterDAO.findOne(counterId, { notFound: true }),
      userDAO.findOne(userId, { notFound: true })
    ]);

    counterParticipantDAO.create({
      counter,
      user
    });
  }

  async removeParticipant(counterId: Id, userId: Id) {
    return counterParticipantDAO.deleteByCounterIdUserId(counterId, userId);
  }
}

export default new CounterService();
