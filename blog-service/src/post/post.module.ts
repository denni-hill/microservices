import { Module } from "@nestjs/common";
import { PostService } from "./post.service";
import { CreatePostDTOValidationPipe } from "./joi/pipes";
import { PostDTOJoiSchemaProvider } from "./joi/providers";
import { BlogPostController } from "./blog-post.controller";
import { DAOModule } from "../dao/dao.module";

@Module({
  providers: [
    PostService,
    PostDTOJoiSchemaProvider,
    CreatePostDTOValidationPipe
  ],
  controllers: [BlogPostController],
  imports: [DAOModule],
  exports: [PostService, PostDTOJoiSchemaProvider]
})
export class PostModule {}
