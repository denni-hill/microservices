import { BlogEntity, UserEntity } from "src/typeorm/entities";

export interface TransformedPostDTO {
  title?: string;
  content?: string;
  author?: UserEntity;
  blog?: BlogEntity;
}
