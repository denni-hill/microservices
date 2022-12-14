import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import { ApiBody, ApiTags } from "@nestjs/swagger";
import { JwtAuthRegisteredGuard, IsAdminGuard } from "../auth/guards";
import { BlogAuthorEntity } from "../typeorm/entities";
import { BlogAuthorService } from "./blog-author.service";
import { BlogAuthorDTO, TransformedBlogAuthorDTO } from "./dto";
import { SetBlogIdParamKey } from "./guards";
import { InjectAdditionalBlogAuthorDataInterceptor } from "./interceptors";
import { CreateBlogAuthorDTOValidationPipe } from "./joi/pipes";

@ApiTags("blog authors")
@Controller("blogs/:blogId/authors")
export class BlogAuthorController {
  constructor(private blogAuthorService: BlogAuthorService) {}

  @SetBlogIdParamKey("blogId")
  @UseGuards(JwtAuthRegisteredGuard, IsAdminGuard)
  @UseInterceptors(InjectAdditionalBlogAuthorDataInterceptor)
  @ApiBody({ type: BlogAuthorDTO })
  @Post()
  async createBlogAuthor(
    @Body(CreateBlogAuthorDTOValidationPipe) dto: TransformedBlogAuthorDTO
  ): Promise<BlogAuthorEntity> {
    return await this.blogAuthorService.createBlogAuthor(dto);
  }

  @Get()
  async getBlogAuthors(
    @Param("blogId", ParseIntPipe) blogId: number
  ): Promise<BlogAuthorEntity[]> {
    return await this.blogAuthorService.getBlogAuthors(blogId);
  }

  @UseGuards(JwtAuthRegisteredGuard, IsAdminGuard)
  @Delete(":userId")
  async deleteBlogAuthor(
    @Param("blogId", ParseIntPipe) blogId: number,
    @Param("userId", ParseIntPipe) userId: number
  ): Promise<void> {
    return await this.blogAuthorService.deleteBlogAuthor(blogId, userId);
  }
}
