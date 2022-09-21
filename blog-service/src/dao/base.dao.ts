import { NotFoundException } from "@nestjs/common";
import {
  BaseEntityWithDeletedAtTimestamp,
  BaseEntityWithId
} from "src/typeorm/entities";
import logger from "src/winston/logger";
import { DataSource, FindOneOptions, Repository } from "typeorm";
import {
  DefaultThrowErrorsOptions,
  PaginationOptions,
  ThrowErrorsOptions
} from "./misc";

export declare type DeepPartial<T> =
  | T
  | (T extends Array<infer U>
      ? DeepPartial<U>[]
      : T extends Map<infer K, infer V>
      ? Map<DeepPartial<K>, DeepPartial<V>>
      : T extends Set<infer M>
      ? Set<DeepPartial<M>>
      : T extends object
      ? {
          [K in keyof T]?: DeepPartial<T[K]>;
        }
      : T);

export abstract class BaseDAO<T extends BaseEntityWithId> {
  constructor(
    protected readonly dataSource: DataSource,
    protected readonly entityTarget: { new (): T },
    protected readonly alias: string
  ) {}

  protected get repository(): Repository<T> {
    return this.dataSource.getRepository(this.entityTarget);
  }

  async create(dto: DeepPartial<T>): Promise<T> {
    let newEntity: T;
    try {
      newEntity = this.repository.create(dto);
    } catch (e) {
      logger.error(
        `Could not create ${this.alias} entity with typeorm repository create method`,
        { error: e, data: dto }
      );
      throw e;
    }

    try {
      const result = await this.repository.save(newEntity);
      logger.info(`${this.alias} is created in database`);
      return result;
    } catch (e) {
      logger.error(`Could not create ${this.alias} in database`, {
        error: e,
        data: newEntity
      });
      throw e;
    }
  }

  async getAll(): Promise<T[]> {
    try {
      return await this.repository.find();
    } catch (e) {
      logger.error(`Could not get all ${this.alias} in database`);
      throw e;
    }
  }

  async getById(
    id: number,
    throwErrorsOptions: ThrowErrorsOptions = new DefaultThrowErrorsOptions()
  ): Promise<T | null> {
    let entity: T;
    try {
      entity = await this.repository.findOne({
        where: { id }
      } as FindOneOptions<T>);
    } catch (e) {
      logger.error(`Could not get ${this.alias} in database`, {
        error: e,
        id
      });
      throw e;
    }

    if (entity === null && throwErrorsOptions.notFound) {
      logger.info(`${this.alias} is not found by id exception thrown`, { id });
      throw new NotFoundException(`${this.alias} in not found`);
    }

    return entity;
  }

  async update(id: number, dto: DeepPartial<T>): Promise<T> {
    const newData = { ...dto };
    delete newData.id;

    const entity = await this.getById(id, { notFound: true });

    try {
      this.repository.manager.merge(this.entityTarget, entity, newData);
    } catch (e) {
      logger.error(
        `Could not merge incoming data with ${this.alias} entity with typeorm manager`,
        { error: e, entity, data: newData }
      );
      throw e;
    }

    try {
      const result = await this.repository.save<T>(entity);
      logger.info(`${this.alias} was updated in database`, {
        id,
        result,
        data: newData
      });
      return result;
    } catch (e) {
      logger.error(`Could not update ${this.alias} in database`, {
        error: e,
        entity,
        data: newData
      });
      throw e;
    }
  }

  async delete(
    id: number,
    throwErrorsOptions: ThrowErrorsOptions = new DefaultThrowErrorsOptions()
  ): Promise<void> {
    let affectedRowsCount: number;
    try {
      affectedRowsCount = (await this.repository.delete(id)).affected;
    } catch (e) {
      logger.error(`Could not delete ${this.alias} in database`, {
        error: e,
        id
      });
      throw e;
    }

    if (affectedRowsCount === 0 && throwErrorsOptions.notFound)
      throw new NotFoundException(`${this.alias} is not found`);
  }

  async isExist(id: number): Promise<boolean> {
    try {
      const entity = await this.repository.findOne({
        where: { id }
      } as FindOneOptions<T>);

      return entity !== null;
    } catch (e) {
      logger.error(`Could not check if ${this.alias} exists in database`, {
        id
      });
      throw e;
    }
  }

  protected parsePagination(paginationOptions: PaginationOptions): {
    take: number;
    skip: number;
  } {
    const take = paginationOptions.count;
    const skip = (paginationOptions.page - 1) * paginationOptions.count;

    return {
      skip,
      take
    };
  }
}

export abstract class BaseDAOWithSoftDelete<
  T extends BaseEntityWithDeletedAtTimestamp
> extends BaseDAO<T> {
  async softDelete(id: number): Promise<T> {
    const entity = await this.getById(id, { notFound: true });
    try {
      return await this.repository.softRemove(entity);
    } catch (e) {
      logger.error(`Could not soft remove ${this.alias} in database`, {
        error: e,
        id
      });
      throw e;
    }
  }

  async recover(id: number): Promise<T> {
    const entity = await this.getById(id, { notFound: true });
    try {
      return await this.repository.recover(entity);
    } catch (e) {
      logger.error(`Could not recover ${this.alias} in database`, {
        error: e,
        id
      });
      throw e;
    }
  }
}
