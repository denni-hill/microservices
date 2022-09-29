import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { BlogAuthorEntity } from "./blog-author.entity";
import { PostEntity } from "./post.entity";

@Entity({ name: "blogs" })
export class BlogEntity extends BaseEntity {
  @Column()
  name: string;

  @Column()
  description: string;

  @OneToMany(() => PostEntity, (post) => post.blog)
  posts: PostEntity[];

  @OneToMany(() => BlogAuthorEntity, (author) => author.blog)
  authors: BlogAuthorEntity[];
}
