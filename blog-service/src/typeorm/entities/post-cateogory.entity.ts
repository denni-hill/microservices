import { Entity, ManyToOne, Unique } from "typeorm";
import { BaseEntityWithId } from "./base.entity";
import { CategoryEntity } from "./category.entity";
import { PostEntity } from "./post.entity";

@Entity({ name: "posts__categories" })
@Unique(["post", "category"])
export class PostCategoryEntity extends BaseEntityWithId {
  @ManyToOne(() => PostEntity, (post) => post.categories, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  })
  post: PostEntity;

  @ManyToOne(() => CategoryEntity, (category) => category.posts, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  })
  category: CategoryEntity;
}
