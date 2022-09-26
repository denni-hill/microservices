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
import { IsAdminGuard, JwtAuthRegisteredGuard } from "src/auth/guards";
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
  @Patch(":id")
  async updateBlog(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: BlogDTO
  ) {
    return await this.blogService.update(id, dto);
  }

  @UseGuards(JwtAuthRegisteredGuard, IsAdminGuard)
  @Delete(":id")
  async softDeleteBlog(@Param("id", ParseIntPipe) id: number) {
    return await this.blogService.softDelete(id);
  }

  @UseGuards(JwtAuthRegisteredGuard, IsAdminGuard)
  @Patch(":id/recover")
  async recoverBlog(@Param("id", ParseIntPipe) id: number) {
    return await this.blogService.recover(id);
  }

  @UseGuards(JwtAuthRegisteredGuard, IsAdminGuard)
  @Delete(":id/purge")
  async deleteBlog(@Param("id", ParseIntPipe) id: number) {
    return await this.blogService.delete(id);
  }
}
