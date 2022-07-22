import Axios from "axios";
import jwt from "jsonwebtoken";
import InternalServerError from "../errors/internal.error";
import { BaseService } from "./base.service";

const authServiceAxios = Axios.create({
  baseURL: process.env.AUTH_SERVICE_HOST,
  headers: {
    authorization: jwt.sign(
      {
        is_admin: true,
        user_id: "COUNTER-SERVICE"
      },
      process.env.ACCESS_TOKEN_SECRET
    )
  }
});

class AuthService extends BaseService {
  async isAccessTokenValid(accessToken: string): Promise<boolean> {
    try {
      jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    } catch (e) {
      return false;
    }

    try {
      await authServiceAxios.post("/service-check", accessToken, {
        headers: {
          "content-type": "text/plain"
        }
      });

      return true;
    } catch (e) {
      throw new InternalServerError(
        "Could not check if access token valid in auth service",
        e
      );
    }
  }

  async isAuthUserExist(authUserId: number): Promise<boolean> {
    await this.validateId(authUserId);
    try {
      return (await authServiceAxios.get(`/users/is-exist/${authUserId}`)).data;
    } catch {
      return false;
    }
  }
}

export default new AuthService();
