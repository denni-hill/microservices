import Axios from "axios";

const authServiceAxios = Axios.create({
  baseURL: "http://auth-service"
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
}

export default new AuthService();
