import { Counter } from "../database/entities/counter.entity";
import InternalServerError from "../errors/internal.error";
import { BaseDAO } from "./base.dao";
import { Id } from "./id";

class CounterDAO extends BaseDAO<Counter> {
  protected readonly alias = "Counter";
  protected readonly entityClass = Counter;

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
