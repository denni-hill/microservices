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
import { ApiBody, ApiTags } from "@nestjs/swagger";
import { IsAdminGuard, JwtAuthRegisteredGuard } from "../auth/guards";
import { SetBlogIdParamKey, IsBlogAuthorGuard } from "../blog-author/guards";
import { InjectAdditionalBlogPostDataInterceptor } from "../blog/interceptors";
import { PostDTO, TransformedPostDTO } from "./dto";
import {
  CreatePostDTOValidationPipe,
  UpdatePostDTOValidationPipe
} from "./joi/pipes";
import { PostService } from "./post.service";

@ApiTags("blog posts")
@SetBlogIdParamKey("blogId")
@Controller("/blogs/:blogId/posts")
export class BlogPostController {
  constructor(private postService: PostService) {}

  @UseGuards(JwtAuthRegisteredGuard, IsBlogAuthorGuard)
  @UseInterceptors(InjectAdditionalBlogPostDataInterceptor)
  @Post()
  @ApiBody({ type: PostDTO })
  async createPost(
    @Body(CreatePostDTOValidationPipe) postDTO: TransformedPostDTO
  ) {
    return await this.postService.create(postDTO);
  }

  @Get()
  async getBlogPosts(@Param("blogId", ParseIntPipe) blogId: number) {
    return await this.postService.getBlogPosts(blogId);
  }

  @Get(":postId")
  async getBlogPost(
    @Param("blogId", ParseIntPipe) blogId: number,
    @Param("postId", ParseIntPipe) postId: number
  ) {
    return await this.postService.getBlogPost(blogId, postId);
  }

  @UseGuards(JwtAuthRegisteredGuard, IsBlogAuthorGuard)
  @Patch(":postId")
  @ApiBody({ type: PostDTO })
  async updatePost(
    @Param("postId", ParseIntPipe) postId: number,
    @Body(UpdatePostDTOValidationPipe) postDTO: TransformedPostDTO
  ) {
    return await this.postService.update(postId, postDTO);
  }

  @UseGuards(JwtAuthRegisteredGuard, IsBlogAuthorGuard)
  @Delete(":postId")
  async softDeletePost(@Param("postId", ParseIntPipe) postId: number) {
    return await this.postService.softDelete(postId);
  }

  @UseGuards(JwtAuthRegisteredGuard, IsBlogAuthorGuard)
  @Patch(":postId/recover")
  async restorePost(@Param("postId", ParseIntPipe) postId: number) {
    return await this.postService.recover(postId);
  }

  @UseGuards(JwtAuthRegisteredGuard, IsAdminGuard)
  @Delete(":postId/purge")
  async deletePost(@Param("postId", ParseIntPipe) postId: number) {
    return await this.postService.delete(postId);
  }
}
