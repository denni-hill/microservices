import { FindManyOptions } from "typeorm";

interface UpdateController<T> {
  update(findOptions: FindManyOptions<T>, data: Partial<T>): Promise<T[]>;
}

export default UpdateController;
