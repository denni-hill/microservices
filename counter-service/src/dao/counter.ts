import { Counter } from "../database/entities/counter";
import { BaseDAO } from "./base-dao";

class CounterDAO extends BaseDAO<Counter> {
  protected entityClass = Counter;
}

export default new CounterDAO();
