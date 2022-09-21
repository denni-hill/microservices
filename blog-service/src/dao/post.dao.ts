import { Injectable } from "@nestjs/common";
import { PostEntity } from "src/typeorm/entities";
import { TypeormService } from "src/typeorm/typeorm.service";
import { BaseDAOWithSoftDelete } from "./base.dao";

@Injectable()
export class PostDAO extends BaseDAOWithSoftDelete<PostEntity> {
  constructor(typeORM: TypeormService) {
    super(typeORM.defaultDataSource, PostEntity, "Post");
  }
}
