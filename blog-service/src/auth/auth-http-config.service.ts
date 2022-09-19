import { HttpModuleOptions, HttpModuleOptionsFactory } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthHttpConfigService implements HttpModuleOptionsFactory {
  constructor(private config: ConfigService, private jwt: JwtService) {}
  createHttpOptions(): HttpModuleOptions | Promise<HttpModuleOptions> {
    return {
      baseURL: this.config.get("AUTH_SERVICE_HOST"),
      headers: {
        authorization:
          "Bearer " +
          this.jwt.sign(
            {
              is_admin: true,
              isInternalServiceToken: true
            },
            {
              secret: this.config.get("ACCESS_TOKEN_SECRET"),
              issuer: this.config.get("DOMAIN")
            }
          )
      }
    };
  }
}
