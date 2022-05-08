import { FindManyOptions } from "typeorm";

interface DeleteController<T> {
  delete(findOptions: FindManyOptions<T>): Promise<void>;
}

export default DeleteController;
