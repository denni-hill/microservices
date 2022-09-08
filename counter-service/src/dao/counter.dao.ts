import { Counter } from "../database/entities/counter.entity";
import InternalServerError from "../errors/internal.error";
import { BaseDAO, DefaultThrowErrorsOptions } from "./base.dao";
import { DeepPartial } from "./deep-partial";
import { Id } from "./id";

class CounterDAO extends BaseDAO<Counter> {
  protected readonly alias = "Counter";
  protected readonly entityClass = Counter;

  override async update(
    id: number,
    data: DeepPartial<Counter>,
    throwErrorsOptions?: DefaultThrowErrorsOptions
  ): Promise<Counter> {
    const newData = { ...data };
    delete newData.owner;
    return super.update(id, newData, throwErrorsOptions);
  }

  async isCounterOwner(userId: Id, counterId: Id): Promise<boolean> {
    await Promise.all([this.validateId(userId), this.validateId(counterId)]);

    try {
      return (
        (await this.repository.count({
          relations: ["owner"],
          where: {
            id: counterId,
            owner: {
              id: userId
            }
          }
        })) > 0
      );
    } catch (e) {
      throw new InternalServerError(
        `Could not check if user is ${this.alias}'s owner in database`,
        e,
        { userId, counterId }
      );
    }
  }
}

export default new CounterDAO();
