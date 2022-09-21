import { Module } from "@nestjs/common";
import { TypeormModule } from "src/typeorm/typeorm.module";
import { BlogAuthorDAO } from "./blog-author.dao";
import { BlogDAO } from "./blog.dao";
import { CategoryDAO } from "./category.dao";
import { CommentDAO } from "./comment.dao";
import { PostCategoryDAO } from "./post-category.dao";
import { PostDAO } from "./post.dao";
import { UserDAO } from "./user.dao";

@Module({
  imports: [TypeormModule],
  providers: [
    UserDAO,
    BlogDAO,
    PostDAO,
    PostCategoryDAO,
    BlogAuthorDAO,
    CategoryDAO,
    CommentDAO
  ],
  exports: [
    UserDAO,
    BlogDAO,
    PostDAO,
    PostCategoryDAO,
    BlogAuthorDAO,
    CategoryDAO,
    CommentDAO
  ]
})
export class DAOModule {}
