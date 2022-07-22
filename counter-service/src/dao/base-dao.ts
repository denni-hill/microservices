import { DeepPartial, FindManyOptions, FindOneOptions } from "typeorm";
import { defaultDataSource } from "../database";

export interface CanCreateDAO<T> {
  create(data: DeepPartial<T>): Promise<T>;
}

export interface CanUpdateDAO<T> {
  update(options: FindManyOptions<T>, data: DeepPartial<T>): Promise<T[]>;
}

export interface CanDeleteDAO<T> {
  delete(options: FindManyOptions<T>): Promise<number>;
}

export interface CanFindDAO<T> {
  find(options: FindManyOptions<T>): Promise<T[]>;
  findOne(options: FindOneOptions<T>): Promise<T>;
}

export abstract class BaseDAO<T>
  implements CanCreateDAO<T>, CanUpdateDAO<T>, CanDeleteDAO<T>, CanFindDAO<T>
{
  protected abstract readonly entityClass: { new (): T };

  async create(data: DeepPartial<T>): Promise<T> {
    const newEntity = defaultDataSource.manager.create<T>(
      this.entityClass,
      data
    );

    return await defaultDataSource.manager.save(newEntity);
  }

  async findOne(options?: FindOneOptions<T>): Promise<T> {
    return defaultDataSource.manager.findOne<T>(this.entityClass, options);
  }

  async find(options?: FindManyOptions<T>): Promise<T[]> {
    return defaultDataSource.manager.find<T>(this.entityClass, options);
  }

  async update(
    options: FindManyOptions<T>,
    data: DeepPartial<T>
  ): Promise<T[]> {
    const entities = await defaultDataSource.manager.find<T>(
      this.entityClass,
      options
    );

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    delete data.id;

    entities.forEach((entity) =>
      defaultDataSource.manager.merge(this.entityClass, entity, data)
    );

    return await defaultDataSource.manager.save<T>(entities);
  }

  async delete(options: FindManyOptions<T>): Promise<number> {
    const entities = await defaultDataSource.manager.find<T>(
      this.entityClass,
      options
    );
    return (
      await defaultDataSource.manager.remove<T>(this.entityClass, entities)
    ).length;
  }

  async isExist(options: FindManyOptions<T>): Promise<boolean> {
    return (
      (await defaultDataSource.manager.count(this.entityClass, options)) > 0
    );
  }
}
