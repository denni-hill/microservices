import {
  Controller,
  UseGuards,
  UseInterceptors,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Delete
} from "@nestjs/common";
import { JwtAuthRegisteredGuard } from "../auth/guards";
import { SetBlogIdParamKey, IsBlogAuthorGuard } from "../blog-author/guards";
import { InjectAdditionalBlogPostDataInterceptor } from "../blog/interceptors";
import { TransformedPostDTO } from "./dto";
import {
  CreatePostDTOValidationPipe,
  UpdatePostDTOValidationPipe
} from "./joi/pipes";
import { PostService } from "./post.service";

@SetBlogIdParamKey("blogId")
@Controller("/blogs/:blogId/posts")
export class BlogPostController {
  constructor(private postService: PostService) {}

  @UseGuards(JwtAuthRegisteredGuard, IsBlogAuthorGuard)
  @UseInterceptors(InjectAdditionalBlogPostDataInterceptor)
  @Post()
  async createPost(
    @Body(CreatePostDTOValidationPipe) postDTO: TransformedPostDTO
  ) {
    return await this.postService.create(postDTO);
  }

  @Get()
  async getBlogPosts(@Param("blogId", ParseIntPipe) blogId: number) {
    return await this.postService.getBlogPosts(blogId);
  }

  @UseGuards(JwtAuthRegisteredGuard, IsBlogAuthorGuard)
  @Patch(":id")
  async updatePost(
    @Param("id", ParseIntPipe) postId: number,
    @Body(UpdatePostDTOValidationPipe) postDTO: TransformedPostDTO
  ) {
    return await this.postService.update(postId, postDTO);
  }

  @UseGuards(JwtAuthRegisteredGuard, IsBlogAuthorGuard)
  @Delete(":id")
  async softDeletePost(@Param("id", ParseIntPipe) postId: number) {
    return await this.postService.softDelete(postId);
  }
}
