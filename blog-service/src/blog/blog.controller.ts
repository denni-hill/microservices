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
import { CreateBlogDTO, UpdateBlogDTO } from "./dto";

@Controller("blog")
export class BlogController {
  constructor(private blogService: BlogService) {}
  @UseGuards(JwtAuthRegisteredGuard, IsAdminGuard)
  @Post()
  createBlog(@Body() dto: CreateBlogDTO) {
    return this.blogService.create(dto);
  }

  @UseGuards(JwtAuthRegisteredGuard, IsAdminGuard)
  @Patch(":id")
  updateBlog(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateBlogDTO
  ) {
    return this.blogService.update(id, dto);
  }

  @UseGuards(JwtAuthRegisteredGuard, IsAdminGuard)
  @Delete(":id")
  softDeleteBlog(@Param("id", ParseIntPipe) id: number) {
    return this.blogService.softDelete(id);
  }

  @UseGuards(JwtAuthRegisteredGuard, IsAdminGuard)
  @Patch(":id/recover")
  recoverBlog(@Param("id", ParseIntPipe) id: number) {
    return this.blogService.recover(id);
  }

  @UseGuards(JwtAuthRegisteredGuard, IsAdminGuard)
  @Delete(":id/purge")
  deleteBlog(@Param("id", ParseIntPipe) id: number) {
    return this.blogService.delete(id);
  }
}
