import { Entity, Column, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { BlogEntity } from "./blog.entity";
import { CommentEntity } from "./comment.entity";
import { PostCategoryEntity } from "./post-cateogory.entity";
import { UserEntity } from "./user.entity";

@Entity({ name: "posts" })
export class PostEntity extends BaseEntity {
  @Column()
  title: string;

  @Column()
  content: string;

  @ManyToOne(() => UserEntity, (user) => user.posts, {
    onDelete: "RESTRICT",
    onUpdate: "CASCADE"
  })
  author: UserEntity;

  @ManyToOne(() => BlogEntity, (blog) => blog.posts, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  })
  blog: BlogEntity;

  @OneToMany(() => PostCategoryEntity, (postCategory) => postCategory.post)
  categories: PostCategoryEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.post)
  comments: CommentEntity[];
}
