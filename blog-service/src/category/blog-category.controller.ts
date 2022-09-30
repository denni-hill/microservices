import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CategoryEntity } from "../typeorm/entities";
import { CategoryService } from "./category.service";

@ApiTags("blog categories")
@Controller("/blogs/:blogId/categories")
export class BlogCategoryController {
  constructor(private categoryService: CategoryService) {}

  @Get()
  async getBlogCategories(
    @Param("blogId", ParseIntPipe) blogId: number
  ): Promise<CategoryEntity[]> {
    return await this.categoryService.getBlogCategories(blogId);
  }
}
