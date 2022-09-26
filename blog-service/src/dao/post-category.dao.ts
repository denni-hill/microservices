import { Injectable } from "@nestjs/common";
import { PostCategoryEntity } from "../typeorm/entities";
import { TypeormService } from "../typeorm/typeorm.service";
import { BaseDAO } from "./base.dao";

@Injectable()
export class PostCategoryDAO extends BaseDAO<PostCategoryEntity> {
  constructor(typeORM: TypeormService) {
    super(typeORM.defaultDataSource, PostCategoryEntity, "Post category");
  }
}
