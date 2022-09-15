import { defaultDataSource } from "../database";
import { CounterInvite } from "../database/entities/counter-invite.entity";
import { CounterParticipant } from "../database/entities/counter-participant.entity";
import { ConflictError } from "../errors/conflict.error";
import InternalServerError from "../errors/internal.error";
import logger from "../logger";
import { BaseDAO } from "./base.dao";
import { DeepPartial } from "./deep-partial";
import { Id } from "./id";

class CounterInviteDAO extends BaseDAO<CounterInvite> {
  protected readonly alias = "Counter invite";
  protected readonly entityClass = CounterInvite;

  override async create(
    data: DeepPartial<CounterInvite>
  ): Promise<CounterInvite> {
    if (await this.isExistByCounterIdUserId(data.counter.id, data.user.id))
      throw new ConflictError(
        "Invite for this counter is already sent to this user"
      );

    return await super.create(data);
  }

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

  async getUserInvites(userId: Id): Promise<CounterInvite[]> {
    await this.validateId(userId);

    return await this.repository.find({
      where: {
        user: {
          id: userId
        }
      }
    });
  }

  async getCounterInvites(counterId: Id): Promise<CounterInvite[]> {
    await this.validateId(counterId);

    return await this.repository.find({
      where: {
        counter: {
          id: counterId
        }
      }
    });
  }

  async isInviteReciever(inviteId: Id, userId: Id): Promise<boolean> {
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
        "Could not check if user is invite owner in database",
        e,
        { inviteId, userId }
      );
    }
  }

  async isExistByCounterIdUserId(counterId: Id, userId: Id): Promise<boolean> {
    await Promise.all([this.validateId(counterId), this.validateId(userId)]);

    try {
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
    } catch (e) {
      throw new InternalServerError(
        `Could not check if ${this.alias} exist by counter id and user id`,
        e,
        { counterId, userId }
      );
    }
  }
}

export default new CounterInviteDAO();
