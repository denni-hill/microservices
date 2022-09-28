import { BlogEntity, UserEntity } from "../../typeorm/entities";

export interface TransformedBlogAuthorDTO {
  blog?: BlogEntity;
  user?: UserEntity;
}
