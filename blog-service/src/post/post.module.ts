import { Module } from "@nestjs/common";
import { PostService } from "./post.service";
import { PostController } from "./post.controller";
import { DAOModule } from "src/dao/dao.module";
import { CreatePostDTOValidationPipe } from "./joi/pipes";
import { PostDTOJoiSchemaProvider } from "./joi/providers";
import { BlogPostController } from "./blog-post.controller";

@Module({
  providers: [
    PostService,
    PostDTOJoiSchemaProvider,
    CreatePostDTOValidationPipe
  ],
  controllers: [PostController, BlogPostController],
  imports: [DAOModule],
  exports: [PostService, PostDTOJoiSchemaProvider]
})
export class PostModule {}
