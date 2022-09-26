import { Module } from "@nestjs/common";
import { DAOModule } from "src/dao/dao.module";
import { BlogAuthorController } from "./blog-author.controller";
import { BlogAuthorService } from "./blog-author.service";
import { IsBlogAuthorGuard } from "./guards";

@Module({
  imports: [DAOModule],
  providers: [BlogAuthorService, IsBlogAuthorGuard],
  controllers: [BlogAuthorController]
})
export class BlogAuthorModule {}
