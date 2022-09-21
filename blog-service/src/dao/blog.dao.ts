import { Injectable } from "@nestjs/common";
import { BlogEntity } from "src/typeorm/entities";
import { TypeormService } from "src/typeorm/typeorm.service";
import { BaseDAOWithSoftDelete } from "./base.dao";

@Injectable()
export class BlogDAO extends BaseDAOWithSoftDelete<BlogEntity> {
  constructor(typeORM: TypeormService) {
    super(typeORM.defaultDataSource, BlogEntity, "Blog");
  }
}
