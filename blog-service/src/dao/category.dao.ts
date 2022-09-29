import { Injectable } from "@nestjs/common";
import { CategoryEntity } from "../typeorm/entities";
import { TypeormService } from "../typeorm/typeorm.service";
import logger from "../winston/logger";
import { BaseDAO } from "./base.dao";

@Injectable()
export class CategoryDAO extends BaseDAO<CategoryEntity> {
  constructor(typeORM: TypeormService) {
    super(typeORM.defaultDataSource, CategoryEntity, "Category");
  }

  async getPostCategories(postId: number): Promise<CategoryEntity[]> {
    this.validateId(postId);

    try {
      return this.repository.find({
        where: {
          post: {
            id: postId
          }
        }
      });
    } catch (e) {
      logger.error(`Could not get post categories in database`, {
        error: e,
        postId
      });
      throw e;
    }
  }

  async getBlogCategories(blogId: number): Promise<CategoryEntity[]> {
    this.validateId(blogId);

    try {
      return await this.repository
        .createQueryBuilder("category")
        .distinctOn(["category.name"])
        .leftJoin("category.post", "post")
        .leftJoin("post.blog", "blog")
        .where("blog.id = :blogId", { blogId })
        .getMany();
    } catch (e) {
      logger.error(`Could not get blog categories in database`, {
        error: e,
        blogId
      });
      throw e;
    }
  }
}
