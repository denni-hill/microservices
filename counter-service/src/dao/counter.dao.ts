import { Counter } from "../database/entities/counter.entity";
import { BaseDAO } from "./base.dao";
import { Id } from "./id";

class CounterDAO extends BaseDAO<Counter> {
  protected entityClass = Counter;

  async isCounterOwner(userId: Id, counterId: Id): Promise<boolean> {
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
  }
}

export default new CounterDAO();
