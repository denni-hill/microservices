import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { DAOModule } from "./dao/dao.module";
import { BlogModule } from "./blog/blog.module";
import { TypeormModule } from "./typeorm/typeorm.module";
import path from "path";
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [
        path.join(process.cwd(), ".env"),
        path.join(process.cwd(), "..", ".env")
      ]
    }),
    AuthModule,
    UserModule,
    DAOModule,
    BlogModule,
    TypeormModule
  ]
})
export class AppModule {}
