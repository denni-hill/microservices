import { NotFoundException } from "@nestjs/common";
import Joi from "joi";
import {
  DataSource,
  FindManyOptions,
  FindOneOptions,
  IsNull,
  Not,
  Repository
} from "typeorm";
import { idSchema } from "../joi/customs";
import {
  BaseEntityWithId,
  BaseEntityWithDeletedAtTimestamp
} from "../typeorm/entities";
import logger from "../winston/logger";
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

  get notFoundErrorMessage(): string {
    return `${this.alias} is not found`;
  }

  createEntity(dto: DeepPartial<T>): T {
    try {
      return this.repository.create(dto);
    } catch (e) {
      logger.error(
        `Could not create ${this.alias} entity with typeorm repository create method`,
        { error: e, data: dto }
      );
      throw e;
    }
  }

  async create(dto: DeepPartial<T>): Promise<T> {
    const newEntity = this.createEntity(dto);

    try {
      const result = await this.repository.save(newEntity);
      logger.info(`${this.alias} was created in database`, { newEntity });
      return result;
    } catch (e) {
      logger.error(`Could not create ${this.alias} in database`, {
        error: e,
        data: newEntity
      });
      throw e;
    }
  }

  async createMany(dtos: DeepPartial<T>[]): Promise<T[]> {
    const newEntities = dtos.map((dto) => this.createEntity(dto));

    try {
      const result = await this.repository.save(newEntities);
      result.forEach((newEntity) => {
        logger.info(`${this.alias} was created in database`, {
          entity: newEntity
        });
      });
      return result;
    } catch (e) {
      logger.error(`Could not create many ${this.alias} in database`, {
        error: e,
        data: dtos
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
    this.validateId(id);
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

    if (entity === null && throwErrorsOptions.notFound)
      throw new NotFoundException(this.notFoundErrorMessage);

    return entity;
  }

  async update(id: number, dto: DeepPartial<T>): Promise<T> {
    this.validateId(id);
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
        previousData: entity,
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
    this.validateId(id);
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

    if (affectedRowsCount === 0) {
      if (throwErrorsOptions.notFound)
        throw new NotFoundException(this.notFoundErrorMessage);
    } else logger.info(`${this.alias} was deleted in database`);
  }

  async isExist(id: number): Promise<boolean> {
    this.validateId(id);
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

  async deleteMany(ids: number[]): Promise<void> {
    const idArrayValidationResult = Joi.array()
      .items(idSchema.required().label("id"))
      .label("array of id")
      .validate(ids);

    if (idArrayValidationResult.error) throw idArrayValidationResult.error;

    try {
      await this.repository.delete(ids);
    } catch (e) {
      logger.error(`Could not delete many ${this.alias} in database`, {
        error: e,
        ids
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

  protected validateId(id: number) {
    const result = idSchema.required().label("id").validate(id);
    if (result.error !== undefined) throw result.error;
  }
}

export abstract class BaseDAOWithSoftDelete<
  T extends BaseEntityWithDeletedAtTimestamp
> extends BaseDAO<T> {
  async getDeletedById(
    id: number,
    throwErrorsOptions: ThrowErrorsOptions = new DefaultThrowErrorsOptions()
  ): Promise<T | null> {
    this.validateId(id);
    let entity: T;
    try {
      entity = await this.repository.findOne({
        where: { id },
        withDeleted: true
      } as FindOneOptions<T>);
    } catch (e) {
      logger.error(`Could not get deleted ${this.alias} in database`, {
        error: e,
        id
      });
      throw e;
    }

    if (entity === null && throwErrorsOptions.notFound) {
      throw new NotFoundException(this.notFoundErrorMessage);
    }

    return entity;
  }

  async getAllDeleted(): Promise<T[]> {
    try {
      return this.repository.find({
        where: { deletedAt: Not(IsNull()) },
        withDeleted: true
      } as FindManyOptions<T>);
    } catch (e) {
      logger.error(`Could not get all ${this.alias} in database`);
      throw e;
    }
  }

  async softDelete(id: number): Promise<T> {
    this.validateId(id);
    const entity = await this.getById(id, { notFound: true });
    try {
      const result = await this.repository.softRemove(entity);
      logger.info(`${this.alias} was softly deleted in database`);
      return result;
    } catch (e) {
      logger.error(`Could not soft remove ${this.alias} in database`, {
        error: e,
        id
      });
      throw e;
    }
  }

  async recover(id: number): Promise<T> {
    this.validateId(id);
    const entity = await this.getDeletedById(id, { notFound: true });
    try {
      const result = await this.repository.recover(entity);
      logger.info(`${this.alias} was recovered in database`);
      return result;
    } catch (e) {
      logger.error(`Could not recover ${this.alias} in database`, {
        error: e,
        id
      });
      throw e;
    }
  }
}
