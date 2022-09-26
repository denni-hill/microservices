import { Injectable } from "@nestjs/common";
import { PostEntity } from "../typeorm/entities";
import { TypeormService } from "../typeorm/typeorm.service";
import logger from "../winston/logger";
import { BaseDAOWithSoftDelete } from "./base.dao";

@Injectable()
export class PostDAO extends BaseDAOWithSoftDelete<PostEntity> {
  constructor(typeORM: TypeormService) {
    super(typeORM.defaultDataSource, PostEntity, "Post");
  }

  async getBlogPosts(blogId: number): Promise<PostEntity[]> {
    try {
      return await this.repository.find({
        where: {
          blog: {
            id: blogId
          }
        }
      });
    } catch (e) {
      logger.error(`Could not get blog posts in database`, {
        error: e,
        blogId
      });
      throw e;
    }
  }
}
