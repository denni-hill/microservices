import { Entity, Column, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { BlogEntity } from "./blog.entity";
import { CategoryEntity } from "./category.entity";
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

  @OneToMany(() => CategoryEntity, (category) => category.post, { eager: true })
  categories: CategoryEntity[];
}
