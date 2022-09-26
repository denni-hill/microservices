import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { User } from "src/auth/decorators";
import { UserData } from "src/auth/dto";
import { IsAdminGuard, JwtAuthRegisteredGuard } from "src/auth/guards";
import { DeepPartial } from "src/dao/base.dao";
import { PostEntity } from "src/typeorm/entities";
import { CreatePostDTOValidationPipe } from "./joi/pipes";
import { PostService } from "./post.service";

@Controller("posts")
export class PostController {
  constructor(private postService: PostService) {}

  @UseGuards(JwtAuthRegisteredGuard, IsAdminGuard, CreatePostDTOValidationPipe)
  @Post()
  async createPost(
    @User() user: UserData,
    @Body() dto: DeepPartial<PostEntity>
  ) {
    dto.author = user;
    await this.postService.create(dto);
  }
}
