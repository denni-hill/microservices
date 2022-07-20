import { DeepPartial, FindManyOptions } from "typeorm";
import { defaultDataSource } from "../database";
import { User } from "../database/entities/user";
import { BaseDAO } from "./base-dao";

class UserDAO extends BaseDAO<User> {
  protected entityClass = User;

  async update(
    options: FindManyOptions<User>,
    data: DeepPartial<User>
  ): Promise<User[]> {
    const newData = { ...data };
    delete newData.authUserId;
    delete newData.id;
    return await super.update(options, newData);
  }

  async isAuthUserIdRegistered(authUserId: number): Promise<boolean> {
    return (
      (await defaultDataSource.manager.count<User>(User, {
        where: {
          authUserId
        }
      })) > 0
    );
  }
}

export default new UserDAO();
