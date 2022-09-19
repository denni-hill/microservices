import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { DAOModule } from "src/dao/dao.module";
import { AuthHttpConfigService } from "./auth-http-config.service";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./strategy";

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  imports: [
    DAOModule,
    JwtModule.register({}),
    ConfigModule,
    HttpModule.registerAsync({
      imports: [ConfigModule, JwtModule],
      useClass: AuthHttpConfigService
    })
  ]
})
export class AuthModule {}
