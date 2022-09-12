import { CounterParticipant } from "../database/entities/counter-participant.entity";
import { ConflictError } from "../errors/conflict.error";
import InternalServerError from "../errors/internal.error";
import NotFoundError from "../errors/not-found.error";
import logger from "../logger";
import { BaseDAO, DefaultThrowErrorsOptions } from "./base.dao";
import { DeepPartial } from "./deep-partial";
import { Id } from "./id";

class CounterParticipantDAO extends BaseDAO<CounterParticipant> {
  protected readonly alias = "CounterParticipant";
  protected readonly entityClass = CounterParticipant;

  override async create(
    data: DeepPartial<CounterParticipant>
  ): Promise<CounterParticipant> {
    if (await this.isExistByCounterIdUserId(data.counter.id, data.user.id))
      throw new ConflictError("User is already participates in this counter!");

    return super.create(data);
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
      throw new InternalServerError(`Could check if ${this.alias} exists`, e, {
        counterId,
        userId
      });
    }
  }

  async deleteByCounterIdUserId(
    counterId: Id,
    userId: Id,
    throwErrorsOptions = new DefaultThrowErrorsOptions()
  ): Promise<number> {
    await Promise.all([this.validateId(counterId), this.validateId(userId)]);

    let affectedRowsCount: number;
    try {
      affectedRowsCount = (
        await this.repository.delete({
          user: {
            id: userId
          },
          counter: {
            id: counterId
          }
        })
      ).affected;
    } catch (e) {
      throw new InternalServerError(
        `Could not delete ${this.alias} by counter id and user id`,
        e,
        { counterId, userId }
      );
    }

    if (throwErrorsOptions.notFound && affectedRowsCount === 0)
      throw new NotFoundError({ counterId, userId }, this.alias);

    logger.info("Counter participant was deleted by counter id and user id", {
      counterId,
      userId
    });

    return affectedRowsCount;
  }
}

export default new CounterParticipantDAO();
