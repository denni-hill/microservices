import { build, validate } from "chain-validator-js";
import { Counter } from "../database/entities/counter.entity";
import ValidationError from "../errors/validation.error";
import BaseService from "./base.service";
import counterDAO from "../dao/counter.dao";
import NotFoundError from "../errors/not-found.error";
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
    await BaseService.validateId(counterId);

    if (!(await counterDAO.isExist(counterId)))
      throw new NotFoundError({ id: counterId }, "Counter");

    const validationResult = await validate(
      counterDTO,
      CounterDTOValidationRules()
    );

    if (validationResult.failed) throw new ValidationError(validationResult);

    return await counterDAO.update(counterId, validationResult.validated)[0];
  }

  async deleteCounter(counterId: Id): Promise<number> {
    await BaseService.validateId(counterId);

    if (!(await counterDAO.isExist(counterId)))
      throw new NotFoundError({ id: counterId }, "Counter");

    return await counterDAO.delete(counterId);
  }

  async getCounter(counterId: Id): Promise<Counter> {
    await BaseService.validateId(counterId);

    const counter = await counterDAO.findOne(counterId);

    if (counter === undefined)
      throw new NotFoundError({ id: counterId }, "Counter");

    return counter;
  }

  async addParticipant(counterId: Id, userId: Id) {
    const [counter, user] = await Promise.all([
      counterDAO.findOne(counterId).then((counter) => {
        if (counter === undefined)
          throw new NotFoundError({ id: counterId }, "Counter");
        return counter;
      }),
      userDAO.findOne(userId).then((user) => {
        if (user === undefined) throw new NotFoundError({ id: userId }, "User");
        return user;
      })
    ]);

    counterParticipantDAO.create({
      counter,
      user
    });
  }
}

export default new CounterService();
