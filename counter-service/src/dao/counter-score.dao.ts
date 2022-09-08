import { CounterScore } from "../database/entities/counter-score.entity";
import InternalServerError from "../errors/internal.error";
import { BaseDAO } from "./base.dao";
import { Id } from "./id";

class CounterScoreDAO extends BaseDAO<CounterScore> {
  protected readonly alias = "CounterScore";
  protected readonly entityClass = CounterScore;

  async getUserScoresCount(userId: Id): Promise<number> {
    await this.validateId(userId);

    try {
      return await this.repository.count({
        where: {
          from: {
            id: userId
          }
        }
      });
    } catch (e) {
      throw new InternalServerError(
        `Could not get count of user's ${this.alias}s in database`,
        e,
        { userId }
      );
    }
  }
}

export default new CounterScoreDAO();
