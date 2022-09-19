import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { DAOModule } from "src/dao/dao.module";
import { AuthHttpConfigService } from "./auth-http-config.service";
import { AuthService } from "./auth.service";
import { IsAdminGuard } from "./guards/is-admin.guard";
import { JwtStrategy } from "./strategy";
import { JwtRegisteredStrategy } from "./strategy/jwt-registered.strategy";

@Module({
  providers: [AuthService, JwtStrategy, JwtRegisteredStrategy, IsAdminGuard],
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
