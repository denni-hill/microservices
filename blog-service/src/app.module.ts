import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { DAOModule } from "./dao/dao.module";
import { BlogModule } from "./blog/blog.module";
import { TypeormModule } from "./typeorm/typeorm.module";
import { PostModule } from "./post/post.module";
import { BlogAuthorModule } from "./blog-author/blog-author.module";
import path from "path";
import { APP_FILTER } from "@nestjs/core";
import { ExceptionsFilter } from "./exceptions.filter";
@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: ExceptionsFilter
    }
  ],
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
    PostModule,
    BlogAuthorModule,
    BlogModule,
    TypeormModule
  ]
})
export class AppModule {}
