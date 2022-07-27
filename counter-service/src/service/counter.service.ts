import { build, validate } from "chain-validator-js";
import { Counter } from "../database/entities/counter";
import ValidationError from "../errors/validation.error";
import BaseService from "./base.service";
import counterDAO from "../dao/counter";
import NotFoundError from "../errors/not-found.error";

const CounterDTOValidationRules = () =>
  build().schema<Counter>({
    name: build().isString().bail().trim().isLength({ min: 2, max: 128 }),
    description: build()
      .isString()
      .bail()
      .trim()
      .isLength({ min: 0, max: 1024 })
  });

class CounterService {
  async createCounter(counterDTO: Partial<Counter>): Promise<Counter> {
    const validationResult = await validate(
      counterDTO,
      CounterDTOValidationRules()
    );

    if (validationResult.failed) throw new ValidationError(validationResult);

    return await counterDAO.create(validationResult.validated);
  }

  async updateCounter(
    counterId: number,
    counterDTO: Partial<Counter>
  ): Promise<Counter> {
    await BaseService.validateId(counterId);

    if (!(await counterDAO.isExist({ where: { id: counterId } })))
      throw new NotFoundError({ id: counterId }, "Counter");

    const validationResult = await validate(
      counterDTO,
      CounterDTOValidationRules()
    );

    if (validationResult.failed) throw new ValidationError(validationResult);

    return await counterDAO.update(
      { where: { id: counterId } },
      validationResult.validated
    )[0];
  }

  async deleteCounter(counterId: number): Promise<number> {
    await BaseService.validateId(counterId);

    if (!(await counterDAO.isExist({ where: { id: counterId } })))
      throw new NotFoundError({ id: counterId }, "Counter");

    return await counterDAO.delete({ where: { id: counterId } });
  }

  async getCounter(counterId: number): Promise<Counter> {
    await BaseService.validateId(counterId);

    if (!(await counterDAO.isExist({ where: { id: counterId } })))
      throw new NotFoundError({ id: counterId }, "Counter");

    return await counterDAO.findOne({ where: { id: counterId } });
  }
}

export default new CounterService();
