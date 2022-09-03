import { CounterParticipant } from "../database/entities/counter-participant.entity";
import { BaseDAO } from "./base.dao";
import { Id } from "./id";

class CounterParticipantDAO extends BaseDAO<CounterParticipant> {
  protected entityClass = CounterParticipant;

  async isCounterParticipant(counterId: Id, userId: Id): Promise<boolean> {
    await Promise.all([this.validateId(counterId), this.validateId(userId)]);

    return (
      (await this.repository.count({
        where: {
          counter: {
            id: counterId
          },
          user: {
            id: userId
          }
        }
      })) > 0
    );
  }
}

export default new CounterParticipantDAO();
