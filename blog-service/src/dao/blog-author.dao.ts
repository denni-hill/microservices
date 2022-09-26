import { Injectable, NotFoundException } from "@nestjs/common";
import { BlogAuthorEntity } from "../typeorm/entities";
import { TypeormService } from "../typeorm/typeorm.service";
import logger from "../winston/logger";
import { BaseDAO } from "./base.dao";
import { DefaultThrowErrorsOptions, ThrowErrorsOptions } from "./misc";

@Injectable()
export class BlogAuthorDAO extends BaseDAO<BlogAuthorEntity> {
  constructor(TypeORM: TypeormService) {
    super(TypeORM.defaultDataSource, BlogAuthorEntity, "Blog author");
  }

  async deleteByBlogIdUserId(
    userId: number,
    blogId: number,
    throwErrorsOptions: ThrowErrorsOptions = new DefaultThrowErrorsOptions()
  ): Promise<void> {
    let count: number;
    try {
      count = (
        await this.repository.delete({
          user: { id: userId },
          blog: { id: blogId }
        })
      ).affected;
    } catch (e) {
      logger.error(
        `Could not delete ${this.alias} by user id and blog id in database`,
        {
          error: e,
          userId,
          blogId
        }
      );
      throw e;
    }

    if (count === 0 && throwErrorsOptions.notFound)
      throw new NotFoundException(`${this.alias} is not found`);
  }

  async isBlogAuthor(userId: number, blogId: number): Promise<boolean> {
    try {
      return (
        (await this.repository.count({
          where: {
            user: { id: userId },
            blog: { id: blogId }
          }
        })) > 0
      );
    } catch (e) {
      logger.error(`Could not check if user is blog author in database`, {
        error: e,
        userId,
        blogId
      });
      throw e;
    }
  }
}
