import { Module } from "@nestjs/common";
import { TypeormModule } from "../typeorm/typeorm.module";
import { BlogAuthorDAO } from "./blog-author.dao";
import { BlogDAO } from "./blog.dao";
import { CategoryDAO } from "./category.dao";
import { CommentDAO } from "./comment.dao";
import { PostDAO } from "./post.dao";
import { UserDAO } from "./user.dao";

@Module({
  imports: [TypeormModule],
  providers: [
    UserDAO,
    BlogDAO,
    PostDAO,
    BlogAuthorDAO,
    CategoryDAO,
    CommentDAO
  ],
  exports: [UserDAO, BlogDAO, PostDAO, BlogAuthorDAO, CategoryDAO, CommentDAO]
})
export class DAOModule {}
