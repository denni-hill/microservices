import { Module } from "@nestjs/common";
import { TypeormModule } from "../typeorm/typeorm.module";
import { BlogAuthorDAO } from "./blog-author.dao";
import { BlogDAO } from "./blog.dao";
import { CategoryDAO } from "./category.dao";
import { PostDAO } from "./post.dao";
import { UserDAO } from "./user.dao";

@Module({
  imports: [TypeormModule],
  providers: [UserDAO, BlogDAO, PostDAO, BlogAuthorDAO, CategoryDAO],
  exports: [UserDAO, BlogDAO, PostDAO, BlogAuthorDAO, CategoryDAO]
})
export class DAOModule {}
