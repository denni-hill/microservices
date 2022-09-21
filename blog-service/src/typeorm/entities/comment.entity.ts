import { Column, Entity, ManyToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { PostEntity } from "./post.entity";

@Entity({ name: "comments" })
export class CommentEntity extends BaseEntity {
  @Column()
  authorName: string;

  @Column()
  content: string;

  @ManyToOne(() => PostEntity, (post) => post.comments, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  })
  post: PostEntity;
}
