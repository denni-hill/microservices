import { User } from "../database/entities/user.entity";
import { BaseDAO } from "./base.dao";
import { DeepPartial } from "./deep-partial";
import { Id } from "./id";

class UserDAO extends BaseDAO<User> {
  protected entityClass = User;

  async update(id: Id, data: DeepPartial<User>): Promise<User[]> {
    const newData = { ...data };
    delete newData.authUserId;
    delete newData.id;
    return await super.update(id, newData);
  }

  async isAuthUserIdRegistered(authUserId: Id): Promise<boolean> {
    return (
      (await this.repository.count({
        where: { authUserId }
      })) > 0
    );
  }

  async findByNicknameDigits(nickname: string, digits: number): Promise<User> {
    return await this.repository.findOne({
      where: {
        nickname,
        digits
      }
    });
  }

  async findByAuthUserId(authUserId: Id): Promise<User> {
    return await this.repository.findOne({
      where: { authUserId }
    });
  }

  async isNicknameDigitsPairExist(
    nickname: string,
    digits: number
  ): Promise<boolean> {
    return (
      (await this.repository.count({
        where: {
          nickname,
          digits
        }
      })) > 0
    );
  }

  async deleteByAuthUserId(authUserId: Id): Promise<number> {
    return (await this.repository.delete({ authUserId })).affected;
  }
}

export default new UserDAO();
