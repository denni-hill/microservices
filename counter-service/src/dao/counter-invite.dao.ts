import { CounterInvite } from "../database/entities/counter-invite.entity";
import { BaseDAO } from "./base.dao";

class CounterInviteDAO extends BaseDAO<CounterInvite> {
  protected entityClass = CounterInvite;
}

export default new CounterInviteDAO();
