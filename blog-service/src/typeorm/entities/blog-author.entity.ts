import { CreateDateColumn, Entity, ManyToOne, Unique } from "typeorm";
import { BaseEntityWithId } from "./base.entity";
import { BlogEntity } from "./blog.entity";
import { UserEntity } from "./user.entity";

@Entity({ name: "blogs__authors" })
@Unique(["user", "blog"])
export class BlogAuthorEntity extends BaseEntityWithId {
  @ManyToOne(() => UserEntity, (user) => user.authorInBlogs, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  })
  user: UserEntity;

  @ManyToOne(() => BlogEntity, (blog) => blog.authors, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  })
  blog: UserEntity;

  @CreateDateColumn()
  createdAt: Date;
}
