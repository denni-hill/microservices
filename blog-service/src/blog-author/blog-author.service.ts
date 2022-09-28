import { Injectable } from "@nestjs/common";
import { BlogAuthorDAO } from "../dao/blog-author.dao";
import { BlogAuthorEntity } from "../typeorm/entities";
import { TransformedBlogAuthorDTO } from "./dto";

@Injectable()
export class BlogAuthorService {
  constructor(private blogAuthorDAO: BlogAuthorDAO) {}

  async createBlogAuthor(
    dto: TransformedBlogAuthorDTO
  ): Promise<BlogAuthorEntity> {
    return await this.blogAuthorDAO.create(dto);
  }

  async getBlogAuthors(blogId: number): Promise<BlogAuthorEntity[]> {
    return await this.blogAuthorDAO.getAllBlogAuthors(blogId);
  }

  async deleteBlogAuthor(blogId: number, userId: number): Promise<void> {
    return await this.blogAuthorDAO.deleteByBlogIdUserId(blogId, userId, {
      notFound: true
    });
  }
}
