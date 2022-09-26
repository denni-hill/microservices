import { Injectable } from "@nestjs/common";
import { In } from "typeorm";
import { CategoryEntity } from "../typeorm/entities";
import { TypeormService } from "../typeorm/typeorm.service";
import logger from "../winston/logger";
import { BaseDAO } from "./base.dao";

@Injectable()
export class CategoryDAO extends BaseDAO<CategoryEntity> {
  constructor(typeORM: TypeormService) {
    super(typeORM.defaultDataSource, CategoryEntity, "Category");
  }

  async getBlogCategoriesByIds(
    blogId: number,
    categoriesId: number[]
  ): Promise<CategoryEntity[]> {
    try {
      return await this.repository.find({
        where: {
          id: In(categoriesId),
          blog: {
            id: blogId
          }
        }
      });
    } catch (e) {
      logger.error(`Could not get categories by id array`, {
        error: e,
        categoriesId
      });

      throw e;
    }
  }
}
