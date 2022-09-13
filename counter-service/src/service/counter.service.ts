import { build, validate } from "chain-validator-js";
import { Counter } from "../database/entities/counter.entity";
import ValidationError from "../errors/validation.error";
import counterDAO from "../dao/counter.dao";
import userService from "./user.service";
import userDAO from "../dao/user.dao";
import counterParticipantDAO from "../dao/counter-participant.dao";
import { Id } from "../dao/id";
import ForbiddenError from "../errors/forbidden.error";
import { CounterParticipant } from "../database/entities/counter-participant.entity";

const CounterDTOValidationRules = () => ({
  name: build().isString().bail().trim().isLength({ min: 2, max: 128 }),
  description: build().isString().bail().trim().isLength({ min: 0, max: 1024 }),
  owner: build()
    .isInt()
    .bail()
    .customSanitizer(() => async (id: Id) => userService.getUser(id))
});

export interface CounterDTO {
  name: string;
  description: string;
  owner: number;
}

class CounterService {
  async createCounter(counterDTO: CounterDTO): Promise<Counter> {
    const validationResult = await validate(
      counterDTO,
      build().schema(CounterDTOValidationRules())
    );

    if (validationResult.failed) throw new ValidationError(validationResult);

    const counter = await counterDAO.create({
      ...validationResult.validated
    });

    await this.addParticipant(counter.id, counterDTO.owner);

    return counter;
  }

  async updateCounter(counterId: Id, counterDTO: CounterDTO): Promise<Counter> {
    const validationResult = await validate(
      counterDTO,
      build().schema(CounterDTOValidationRules())
    );
    if (validationResult.failed) throw new ValidationError(validationResult);

    const counter = await counterDAO.update(
      counterId,
      validationResult.validated,
      {
        notFound: true
      }
    );

    if (!(await this.isUserCounterParticipant(counter.owner.id, counterId)))
      await this.addParticipant(counter.id, counter.owner.id);

    return counter;
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

  async isUserCounterParticipant(userId: Id, counterId: Id): Promise<boolean> {
    return counterParticipantDAO.isExistByCounterIdUserId(counterId, userId);
  }

  async addParticipant(counterId: Id, userId: Id): Promise<CounterParticipant> {
    const [counter, user] = await Promise.all([
      counterDAO.findOne(counterId, { notFound: true }),
      userDAO.findOne(userId, { notFound: true })
    ]);

    return await counterParticipantDAO.create({
      counter,
      user
    });
  }

  async removeParticipant(counterId: Id, userId: Id) {
    if (await counterDAO.isCounterOwner(userId, counterId))
      throw new ForbiddenError(
        "Cannot delete counter owner from its participants"
      );

    return counterParticipantDAO.deleteByCounterIdUserId(counterId, userId, {
      notFound: true
    });
  }
}

export default new CounterService();
