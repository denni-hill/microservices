import { Module } from "@nestjs/common";
import { PostService } from "./post.service";
import { PostController } from "./post.controller";
import { DAOModule } from "src/dao/dao.module";
import { CreatePostValidationPipe } from "./joi/pipes";
import { PostJoiSchemaProvider } from "./joi/providers";

@Module({
  providers: [PostService, PostJoiSchemaProvider, CreatePostValidationPipe],
  controllers: [PostController],
  imports: [DAOModule],
  exports: [PostService, PostJoiSchemaProvider]
})
export class PostModule {}
