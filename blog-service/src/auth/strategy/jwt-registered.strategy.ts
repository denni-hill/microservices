import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UserDAO } from "../../dao/user.dao";
import { ConfigService } from "@nestjs/config";
import { AuthPayloadDTO } from "../dto";
import { AuthService } from "../auth.service";

@Injectable()
export class JwtRegisteredStrategy extends PassportStrategy(
  Strategy,
  "jwt-registered"
) {
  constructor(
    private userDAO: UserDAO,
    private authService: AuthService,
    config: ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get("ACCESS_TOKEN_SECRET"),
      passReqToCallback: true
    });
  }

  async validate(request: any, payload: AuthPayloadDTO) {
    const accessToken = ExtractJwt.fromAuthHeaderAsBearerToken()(request);

    if (!(await this.authService.isAccessTokenValid(accessToken)))
      throw new UnauthorizedException();

    const user = await this.userDAO.getByAuthUserId(payload.id);
    if (user === null)
      throw new UnauthorizedException(
        "This auth user is not registered in blog service"
      );

    return { ...user, auth: payload };
  }
}
