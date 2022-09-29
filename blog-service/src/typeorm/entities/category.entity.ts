import { Column, Entity, ManyToOne } from "typeorm";
import { BaseEntityWithId } from "./base.entity";
import { PostEntity } from "./post.entity";

@Entity({ name: "categories" })
export class CategoryEntity extends BaseEntityWithId {
  @Column()
  name: string;

  @ManyToOne(() => PostEntity, (post) => post.categories, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  })
  post: PostEntity;
}
