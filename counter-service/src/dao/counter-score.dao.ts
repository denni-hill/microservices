import { CounterScore } from "../database/entities/counter-score.entity";
import { BaseDAO } from "./base.dao";

class CounterScoreDAO extends BaseDAO<CounterScore> {
  protected entityClass = CounterScore;
}

export default new CounterScoreDAO();
