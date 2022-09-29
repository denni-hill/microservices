import { Injectable } from "@nestjs/common";
import { CategoryDAO } from "../dao/category.dao";
import { CategoryEntity } from "../typeorm/entities";

@Injectable()
export class CategoryService {
  constructor(private categoryDAO: CategoryDAO) {}

  async getBlogCategories(blogId: number): Promise<CategoryEntity[]> {
    return await this.categoryDAO.getBlogCategories(blogId);
  }
}
