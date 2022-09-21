import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { BlogAuthorEntity } from "./blog-author.entity";
import { PostEntity } from "./post.entity";

@Entity({ name: "users" })
export class UserEntity extends BaseEntity {
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  sex: boolean;

  @Column({ default: false })
  isAdmin: boolean;

  @Column({ type: "integer", unique: true })
  authUserId: number;

  @OneToMany(() => BlogAuthorEntity, (author) => author.user)
  authorInBlogs: BlogAuthorEntity[];

  @OneToMany(() => PostEntity, (post) => post.author)
  posts: PostEntity[];
}
