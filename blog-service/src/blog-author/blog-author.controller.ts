import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Post,
  UseGuards
} from "@nestjs/common";
import { JwtAuthRegisteredGuard, IsAdminGuard } from "../auth/guards";
import { BlogAuthorEntity } from "../typeorm/entities";
import { BlogAuthorService } from "./blog-author.service";
import { BlogAuthorDTO } from "./dto";

@Controller("blogs/authors")
export class BlogAuthorController {
  constructor(private blogAuthorService: BlogAuthorService) {}
  @UseGuards(JwtAuthRegisteredGuard, IsAdminGuard)
  @Post()
  async assignBlogAuthor(
    @Body() dto: BlogAuthorDTO
  ): Promise<BlogAuthorEntity> {
    return await this.blogAuthorService.assignBlogAuthor(dto);
  }

  @UseGuards(JwtAuthRegisteredGuard, IsAdminGuard)
  @Delete(":id")
  async removeBlogAuthor(@Param("id", ParseIntPipe) id: number): Promise<void> {
    return await this.blogAuthorService.removeBlogAuthor(id);
  }
}
