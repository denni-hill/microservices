import { Injectable, NotFoundException } from "@nestjs/common";
import { PostEntity } from "../typeorm/entities";
import { TypeormService } from "../typeorm/typeorm.service";
import logger from "../winston/logger";
import { BaseDAOWithSoftDelete } from "./base.dao";
import { DefaultThrowErrorsOptions, ThrowErrorsOptions } from "./misc";

@Injectable()
export class PostDAO extends BaseDAOWithSoftDelete<PostEntity> {
  constructor(typeORM: TypeormService) {
    super(typeORM.defaultDataSource, PostEntity, "Post");
  }

  async getBlogPost(
    blogId: number,
    postId: number,
    throwErrorsOptions: ThrowErrorsOptions = new DefaultThrowErrorsOptions()
  ): Promise<PostEntity> {
    let entity: PostEntity;
    try {
      entity = await this.repository.findOne({
        where: {
          blog: {
            id: blogId
          },
          id: postId
        }
      });
    } catch (e) {
      logger.error(`Could not get blog post in database`, {
        error: e,
        blogId,
        postId
      });
      throw e;
    }

    if (entity === null && throwErrorsOptions.notFound)
      throw new NotFoundException(this.notFoundErrorMessage);

    return entity;
  }

  async getBlogPosts(blogId: number): Promise<PostEntity[]> {
    this.validateId(blogId);
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
