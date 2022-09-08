import { defaultDataSource } from "../database";
import { CounterInvite } from "../database/entities/counter-invite.entity";
import { CounterParticipant } from "../database/entities/counter-participant.entity";
import InternalServerError from "../errors/internal.error";
import logger from "../logger";
import { BaseDAO } from "./base.dao";
import { Id } from "./id";

class CounterInviteDAO extends BaseDAO<CounterInvite> {
  protected readonly alias = "CounterInvite";
  protected readonly entityClass = CounterInvite;

  async acceptInvite(inviteId: Id): Promise<CounterParticipant> {
    const invite = await this.findOne(inviteId, { notFound: true });

    let newParticipant: CounterParticipant;

    try {
      await defaultDataSource.transaction(async (manager) => {
        const participant = manager.create<CounterParticipant>(
          CounterParticipant,
          {
            user: invite.user,
            counter: invite.counter
          }
        );

        newParticipant = await manager.save(participant);
        await manager.remove(invite);
      });
    } catch (e) {
      throw new InternalServerError(
        `Could not commit transaction to accept ${this.alias} in database`,
        e
      );
    }

    logger.info("Counter invite was accepted", { invite });
    return newParticipant;
  }
}

export default new CounterInviteDAO();
