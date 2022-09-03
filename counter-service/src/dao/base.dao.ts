import { build, validate } from "chain-validator-js";
import { FindManyOptions, Repository } from "typeorm";
import { defaultDataSource } from "../database";
import ValidationError from "../errors/validation.error";
import { DeepPartial } from "./deep-partial";

export interface CanCreateDAO<T> {
  create(data: DeepPartial<T>): Promise<T>;
}

export interface CanUpdateDAO<T> {
  update(id: number, data: DeepPartial<T>): Promise<T[]>;
}

export interface CanDeleteDAO {
  delete(id: number): Promise<number>;
}

export interface CanFindDAO<T> {
  findOne(id: number): Promise<T>;
}

export abstract class BaseDAO<T extends { id: number }>
  implements CanCreateDAO<T>, CanUpdateDAO<T>, CanDeleteDAO, CanFindDAO<T>
{
  protected abstract readonly entityClass: { new (): T };

  protected get repository(): Repository<T> {
    return defaultDataSource.getRepository(this.entityClass);
  }

  async create(data: DeepPartial<T>): Promise<T> {
    const newEntity = defaultDataSource.manager.create<T>(
      this.entityClass,
      data
    );

    return await defaultDataSource.manager.save(newEntity);
  }

  async findOne(id: number): Promise<T> {
    await this.validateId(id);

    return this.repository.findOne({
      where: { id }
    } as FindManyOptions<T>);
  }

  async update(id: number, data: DeepPartial<T>): Promise<T[]> {
    await this.validateId(id);

    delete data.id; // don't want to update any rows id at all, just in case :)

    const entities = await this.repository.find({
      where: { id }
    } as FindManyOptions<T>);

    entities.forEach((entity) =>
      this.repository.manager.merge(this.entityClass, entity, data)
    );

    return await defaultDataSource.manager.save<T>(entities);
  }

  async delete(id: number): Promise<number> {
    await this.validateId(id);

    return (await this.repository.delete(id)).affected;
  }

  async isExist(id: number): Promise<boolean> {
    await this.validateId(id);

    return (
      (await this.repository.count({
        where: { id }
      } as FindManyOptions<T>)) > 0
    );
  }

  protected async validateId(id: number) {
    const validationResult = await validate(id, build().name("id").isInt());

    if (validationResult.failed) throw new ValidationError(validationResult);
  }
}
