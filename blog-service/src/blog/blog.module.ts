import { Module } from "@nestjs/common";
import { DAOModule } from "../dao/dao.module";
import { PostModule } from "../post/post.module";
import { BlogController } from "./blog.controller";
import { BlogService } from "./blog.service";
import { InjectAdditionalBlogPostDataInterceptor } from "./interceptors";
import { CreateBlogDTOValidationPipe } from "./joi/pipes";
import { BlogDTOJoiSchemaProvider } from "./joi/providers";

@Module({
  controllers: [BlogController],
  providers: [
    BlogService,
    InjectAdditionalBlogPostDataInterceptor,
    BlogDTOJoiSchemaProvider,
    CreateBlogDTOValidationPipe
  ],
  imports: [DAOModule, PostModule]
})
export class BlogModule {}
