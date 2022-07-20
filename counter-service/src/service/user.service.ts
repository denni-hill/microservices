import UserDAO from "../dao/user";

class UserService {
  async getUserByUserAuthId(authUserId: number) {
    return await UserDAO.findOne({
      where: {
        authUserId
      }
    });
  }
}

export default new UserService();
