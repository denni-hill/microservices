import {
  Body,
  Controller,
  Post,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import { JwtAuthRegisteredGuard } from "src/auth/guards";
import { IsBlogAuthorGuard, SetBlogIdParamKey } from "src/blog-author/guards";
import { CreatePostValidationPipe } from "src/post/joi/pipes";
import { PostService } from "src/post/post.service";
import { InjectAdditionalBlogPostDataInterceptor } from "./interceptors";

@Controller("/blogs/:id/posts")
export class BlogPostController {
  constructor(private postService: PostService) {}
  @SetBlogIdParamKey("id")
  @UseGuards(JwtAuthRegisteredGuard, IsBlogAuthorGuard)
  @UseInterceptors(InjectAdditionalBlogPostDataInterceptor)
  @Post()
  async createPost(@Body(CreatePostValidationPipe) postDTO: unknown) {
    return await this.postService.create(postDTO);
  }
}
