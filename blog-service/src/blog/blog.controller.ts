import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards
} from "@nestjs/common";
import { JwtAuthRegisteredGuard, IsAdminGuard } from "../auth/guards";
import { BlogService } from "./blog.service";
import { BlogDTO } from "./dto";
import { CreateBlogDTOValidationPipe } from "./joi/pipes";

@Controller("blogs")
export class BlogController {
  constructor(private blogService: BlogService) {}
  @UseGuards(JwtAuthRegisteredGuard, IsAdminGuard)
  @Post()
  async createBlog(@Body(CreateBlogDTOValidationPipe) dto: BlogDTO) {
    return await this.blogService.create(dto);
  }

  @UseGuards(JwtAuthRegisteredGuard, IsAdminGuard)
  @Patch(":blogId")
  async updateBlog(
    @Param("blogId", ParseIntPipe) id: number,
    @Body() dto: BlogDTO
  ) {
    return await this.blogService.update(id, dto);
  }

  @UseGuards(JwtAuthRegisteredGuard, IsAdminGuard)
  @Delete(":blogId")
  async softDeleteBlog(@Param("blogId", ParseIntPipe) id: number) {
    return await this.blogService.softDelete(id);
  }

  @UseGuards(JwtAuthRegisteredGuard, IsAdminGuard)
  @Patch(":blogId/recover")
  async recoverBlog(@Param("blogId", ParseIntPipe) id: number) {
    return await this.blogService.recover(id);
  }

  @UseGuards(JwtAuthRegisteredGuard, IsAdminGuard)
  @Delete(":blogId/purge")
  async deleteBlog(@Param("blogId", ParseIntPipe) id: number) {
    return await this.blogService.delete(id);
  }
}
