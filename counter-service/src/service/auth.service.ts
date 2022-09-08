import Axios from "axios";
import jwt from "jsonwebtoken";
import { Id } from "../dao/id";
import InternalServerError from "../errors/internal.error";
import { validateId } from "../misc/validate-id";

const authServiceAxios = Axios.create({
  baseURL: process.env.AUTH_SERVICE_HOST,
  headers: {
    authorization:
      "Bearer " +
      jwt.sign(
        {
          is_admin: true,
          isInternalServiceToken: true
        },
        process.env.ACCESS_TOKEN_SECRET,
        { issuer: process.env.DOMAIN }
      )
  }
});

class AuthService {
  protected validateId: { (id: Id): Promise<void> } = validateId;

  async isAccessTokenValid(accessToken: string): Promise<boolean> {
    try {
      jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    } catch (e) {
      return false;
    }

    try {
      const response = await authServiceAxios.post(
        "/service-check",
        accessToken,
        {
          headers: {
            "content-type": "text/plain"
          }
        }
      );

      return response.data === true;
    } catch (e) {
      throw new InternalServerError(
        "Could not check if access token valid in auth service",
        e
      );
    }
  }

  async isAuthUserExist(authUserId: Id): Promise<boolean> {
    await this.validateId(authUserId);

    try {
      return (
        (await authServiceAxios.get(`/users/is-exist/${authUserId}`)).data ===
        true
      );
    } catch (e) {
      throw new InternalServerError(
        "Cound not check if user exist in auth service",
        e
      );
    }
  }
}

export default new AuthService();
