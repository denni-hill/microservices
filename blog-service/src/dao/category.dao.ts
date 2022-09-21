import { Injectable } from "@nestjs/common";
import { CategoryEntity } from "src/typeorm/entities";
import { TypeormService } from "src/typeorm/typeorm.service";
import { BaseDAO } from "./base.dao";

@Injectable()
export class CategoryDAO extends BaseDAO<CategoryEntity> {
  constructor(typeORM: TypeormService) {
    super(typeORM.defaultDataSource, CategoryEntity, "Category");
  }
}
