import { Injectable } from "@nestjs/common";
import { CommentEntity } from "src/typeorm/entities";
import { TypeormService } from "src/typeorm/typeorm.service";
import { BaseDAOWithSoftDelete } from "./base.dao";

@Injectable()
export class CommentDAO extends BaseDAOWithSoftDelete<CommentEntity> {
  constructor(typeORM: TypeormService) {
    super(typeORM.defaultDataSource, CommentEntity, "Comment");
  }
}
