import { Injectable } from "@nestjs/common";
import { CommentEntity } from "../typeorm/entities";
import { TypeormService } from "../typeorm/typeorm.service";
import { BaseDAOWithSoftDelete } from "./base.dao";

@Injectable()
export class CommentDAO extends BaseDAOWithSoftDelete<CommentEntity> {
  constructor(typeORM: TypeormService) {
    super(typeORM.defaultDataSource, CommentEntity, "Comment");
  }
}
