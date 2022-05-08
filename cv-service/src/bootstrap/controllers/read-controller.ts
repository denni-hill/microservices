import { FindManyOptions } from "typeorm";

interface ReadController<T> {
  get(findOptions?: FindManyOptions<T>): Promise<T[]>;
}

export default ReadController;
