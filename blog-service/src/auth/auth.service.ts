import { HttpService } from "@nestjs/axios";
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import logger from "src/winston/logger";

@Injectable()
export class AuthService {
  constructor(private authHttpClient: HttpService) {}

  async isAccessTokenValid(accessToken: string): Promise<boolean> {
    try {
      const response = await this.authHttpClient.axiosRef.post(
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
      logger.error("Could not check if access token is valid in auth service", {
        requestHeaders: e.request.headers,
        requestBody: e.request.body,
        responseHeaders: e.response.headers,
        responseBody: e.response.body,
        responseStatusCode: e.response.status
      });
      throw new InternalServerErrorException();
    }
  }

  async isUserExist(authUserId: number): Promise<boolean> {
    try {
      const response = await this.authHttpClient.axiosRef.post(
        `/users/is-exist/${authUserId}`
      );

      return response.data === true;
    } catch (e) {
      logger.error("Could not check if access token is valid in auth service", {
        requestHeaders: e.request.headers,
        requestBody: e.request.body,
        responseHeaders: e.response.headers,
        responseBody: e.response.body,
        responseStatusCode: e.response.status
      });
      throw new InternalServerErrorException();
    }
  }
}
