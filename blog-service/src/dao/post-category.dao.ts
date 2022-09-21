import { Injectable } from "@nestjs/common";
import { PostCategoryEntity } from "src/typeorm/entities";
import { TypeormService } from "src/typeorm/typeorm.service";
import { BaseDAO } from "./base.dao";

@Injectable()
export class PostCategoryDAO extends BaseDAO<PostCategoryEntity> {
  constructor(typeORM: TypeormService) {
    super(typeORM.defaultDataSource, PostCategoryEntity, "Post category");
  }
}
