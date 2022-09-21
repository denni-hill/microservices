import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { BlogEntity } from "./blog.entity";
import { PostCategoryEntity } from "./post-cateogory.entity";
import { PostEntity } from "./post.entity";

@Entity({ name: "categories" })
export class CategoryEntity extends BaseEntity {
  @Column()
  name: string;

  @ManyToOne(() => BlogEntity, (blog) => blog.categories, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  })
  blog: BlogEntity;

  @OneToMany(() => PostCategoryEntity, (postCategory) => postCategory.category)
  posts: PostEntity[];
}
