import { Module } from "@nestjs/common";
import { DAOModule } from "../dao/dao.module";
import { BlogAuthorController } from "./blog-author.controller";
import { BlogAuthorService } from "./blog-author.service";
import { IsBlogAuthorGuard } from "./guards";
import { InjectAdditionalBlogAuthorDataInterceptor } from "./interceptors";
import { CreateBlogAuthorDTOValidationPipe } from "./joi/pipes";
import { BlogAuthorDTOSchemaProvider } from "./joi/providers";

@Module({
  imports: [DAOModule],
  providers: [
    BlogAuthorService,
    IsBlogAuthorGuard,
    BlogAuthorDTOSchemaProvider,
    CreateBlogAuthorDTOValidationPipe,
    InjectAdditionalBlogAuthorDataInterceptor
  ],
  controllers: [BlogAuthorController]
})
export class BlogAuthorModule {}
