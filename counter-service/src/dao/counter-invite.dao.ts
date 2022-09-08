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

  async isInviteOwner(inviteId: Id, userId: Id): Promise<boolean> {
    await Promise.all([this.validateId(inviteId), this.validateId(userId)]);

    try {
      return (
        (await this.repository.count({
          where: {
            id: inviteId,
            user: {
              id: userId
            }
          }
        })) > 0
      );
    } catch (e) {
      throw new InternalServerError(
        "Could not check if user is invite owner",
        e,
        { inviteId, userId }
      );
    }
  }
}

export default new CounterInviteDAO();
