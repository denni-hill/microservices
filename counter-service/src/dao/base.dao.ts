import { build, validate } from "chain-validator-js";
import { FindOneOptions, Repository } from "typeorm";
import { defaultDataSource } from "../database";
import InternalServerError from "../errors/internal.error";
import NotFoundError from "../errors/not-found.error";
import ValidationError from "../errors/validation.error";
import logger from "../logger";
import { validateId } from "../misc/validate-id";
import { DeepPartial } from "./deep-partial";
import { Id } from "./id";

export interface CanCreateDAO<T> {
  create(data: DeepPartial<T>): Promise<T>;
}

export interface CanUpdateDAO<T> {
  update(
    id: Id,
    data: DeepPartial<T>,
    throwErrorsOptions?: ThrowErrorsOptions
  ): Promise<T>;
}

export interface CanDeleteDAO {
  delete(id: Id, throwErrorsOptions?: ThrowErrorsOptions): Promise<number>;
}

export interface CanSoftDeleteDAO {
  softDelete(id: Id, throwErrorsOptions?: ThrowErrorsOptions): Promise<number>;
  restore(id: Id, throwErrorsOptions?: ThrowErrorsOptions): Promise<number>;
}

export interface CanFindDAO<T> {
  findOne(id: Id, throwErrorsOptions?: ThrowErrorsOptions): Promise<T>;
}

export interface ThrowErrorsOptions {
  notFound: boolean;
}

export class DefaultThrowErrorsOptions implements ThrowErrorsOptions {
  notFound = false;
}

export abstract class BaseDAO<T extends { id: Id }>
  implements CanCreateDAO<T>, CanUpdateDAO<T>, CanDeleteDAO, CanFindDAO<T>
{
  protected abstract readonly entityClass: { new (): T };
  protected abstract readonly alias: string;

  protected get repository(): Repository<T> {
    return defaultDataSource.getRepository(this.entityClass);
  }

  protected validateId: { (id: Id): Promise<void> } = validateId;

  async create(data: DeepPartial<T>): Promise<T> {
    let newEntity: T;
    try {
      newEntity = defaultDataSource.manager.create<T>(this.entityClass, data);
    } catch (e) {
      throw new InternalServerError(
        `Could not create ${this.alias} entity with typeorm manager`,
        e
      );
    }

    try {
      const result = await defaultDataSource.manager.save(newEntity);
      logger.info(`${this.alias} was created in database`, result);
      return result;
    } catch (e) {
      throw new InternalServerError(
        `Could not create ${this.alias} in database`,
        e,
        data
      );
    }
  }

  async findOne(
    id: Id,
    throwErrorsOptions = new DefaultThrowErrorsOptions()
  ): Promise<T> {
    await this.validateId(id);

    let entity: T;

    try {
      entity = await this.repository.findOne({
        where: { id }
      } as FindOneOptions<T>);
    } catch (e) {
      throw new InternalServerError(
        `Could not get ${this.alias} in database`,
        e,
        { id }
      );
    }

    if (throwErrorsOptions.notFound && entity === undefined)
      throw new NotFoundError({ id }, this.alias);

    return entity;
  }

  async update(
    id: Id,
    data: DeepPartial<T>,
    throwErrorsOptions = new DefaultThrowErrorsOptions()
  ): Promise<T> {
    await this.validateId(id);

    const newData = { ...data };

    delete newData.id; // don't want to update any rows id at all, just in case :)

    const entity = await this.findOne(id, throwErrorsOptions);

    try {
      this.repository.manager.merge(this.entityClass, entity, newData);
    } catch (e) {
      throw new InternalServerError(
        "Could not merge entity with typeorm manager",
        e,
        { entity, data: newData }
      );
    }

    try {
      const result = await defaultDataSource.manager.save<T>(entity);
      logger.info(`${this.alias} was updated in database`, {
        id,
        result,
        data: newData
      });
      return result;
    } catch (e) {
      throw new InternalServerError(
        `Could not update ${this.alias} in database`,
        e,
        { entity, data: newData }
      );
    }
  }

  async delete(
    id: Id,
    throwErrorsOptions = new DefaultThrowErrorsOptions()
  ): Promise<number> {
    await this.validateId(id);

    let affectedRowsCount: number;

    try {
      affectedRowsCount = (await this.repository.delete(id)).affected;
    } catch (e) {
      throw new InternalServerError(
        `Could not delete ${this.alias} in database`,
        e,
        { id }
      );
    }

    if (throwErrorsOptions.notFound && affectedRowsCount === 0)
      throw new NotFoundError({ id }, this.alias);

    logger.info(`${this.alias} with id: ${id} was deleted in database`);
    return affectedRowsCount;
  }

  async isExist(id: Id): Promise<boolean> {
    await this.validateId(id);

    try {
      return (
        (await this.repository.count({
          where: { id }
        } as FindOneOptions<T>)) > 0
      );
    } catch (e) {
      throw new InternalServerError(
        `Could not check if ${this.alias} exists in database`,
        e,
        { id }
      );
    }
  }

  protected async parsePagination(
    count: number,
    page: number,
    maxCount = 20
  ): Promise<{ take: number; skip: number }> {
    const validationResult = await validate(
      { count, page },
      build().schema<{
        count: number;
        page: number;
      }>({
        count: build().isInt({ min: 1, max: maxCount }),
        page: build().isInt({ min: 1 })
      })
    );

    if (validationResult.failed) throw new ValidationError(validationResult);

    count = Number(validationResult.validated.count);
    page = Number(validationResult.validated.page);

    const skip = (page - 1) * count;
    const take = count;

    return {
      skip,
      take
    };
  }
}
