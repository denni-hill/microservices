import { Injectable } from "@nestjs/common";
import { BlogAuthorDAO } from "src/dao/blog-author.dao";
import { BlogDAO } from "src/dao/blog.dao";
import { UserDAO } from "src/dao/user.dao";
import { BlogAuthorEntity } from "src/typeorm/entities";
import { BlogAuthorDTO } from "./dto";

@Injectable()
export class BlogAuthorService {
  constructor(
    private blogAuthorDAO: BlogAuthorDAO,
    private userDAO: UserDAO,
    private blogDAO: BlogDAO
  ) {}

  async assignBlogAuthor(dto: BlogAuthorDTO): Promise<BlogAuthorEntity> {
    const user = await this.userDAO.getById(dto.userId, { notFound: true });
    const blog = await this.blogDAO.getById(dto.blogId, { notFound: true });
    return this.blogAuthorDAO.create({ user, blog });
  }

  async removeBlogAuthor(id: number): Promise<void> {
    return this.blogAuthorDAO.delete(id, { notFound: true });
  }
}
