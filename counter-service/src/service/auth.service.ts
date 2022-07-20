import Axios from "axios";
import jwt from "jsonwebtoken";

const authServiceAxios = Axios.create({
  baseURL: process.env.AUTH_SERVICE_HOST,
  headers: {
    authorization: jwt.sign({
      is_admin: true,
      user_id: "COUNTER-SERVICE"
    }, process.env.ACCESS_TOKEN_SECRET)
  }
});

class AuthService {
  async isAccessTokenValid(accessToken: string) {
    try {
      await authServiceAxios.post("/service-check", accessToken, {
        headers: {
          "content-type": "text/plain"
        }
      });

      return true;
    } catch (e) {
      return false;
    }
  }

  async isAuthUserIdValid(authUserId: number){
    try{
      await authServiceAxios.get("/users/")
    }
  }
}

export default new AuthService();
