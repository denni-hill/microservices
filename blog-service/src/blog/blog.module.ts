import { Module } from "@nestjs/common";
import { DAOModule } from "src/dao/dao.module";
import { PostModule } from "src/post/post.module";
import { BlogPostController } from "./blog-post.controller";
import { BlogController } from "./blog.controller";
import { BlogService } from "./blog.service";
import { InjectAdditionalBlogPostDataInterceptor } from "./interceptors";
import { CreateBlogDTOValidationPipe } from "./joi/pipes";
import { BlogJoiSchemaProvider } from "./joi/providers";

@Module({
  controllers: [BlogPostController, BlogController],
  providers: [
    BlogService,
    InjectAdditionalBlogPostDataInterceptor,
    BlogJoiSchemaProvider,
    CreateBlogDTOValidationPipe
  ],
  imports: [DAOModule, PostModule]
})
export class BlogModule {}
