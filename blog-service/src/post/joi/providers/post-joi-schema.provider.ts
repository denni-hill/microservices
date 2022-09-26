import { Injectable } from "@nestjs/common";
import Joi, { ObjectSchema } from "joi";
import { BlogDAO } from "src/dao/blog.dao";
import { UserDAO } from "src/dao/user.dao";
import { parseIntSchema } from "src/joi/customs";
import { JoiSchemaProvider } from "src/joi/providers/joi-schema.provider";
import { PostDTO, TransformedPostDTO } from "src/post/dto";

@Injectable()
export class PostJoiSchemaProvider implements JoiSchemaProvider {
  constructor(private blogDAO: BlogDAO, private userDAO: UserDAO) {}

  get schema(): ObjectSchema<TransformedPostDTO> {
    return Joi.object<TransformedPostDTO, false, PostDTO>({
      title: Joi.string().trim().min(2).max(500),
      content: Joi.string().trim().min(2),
      blog: parseIntSchema.external(
        async (blogId: number) =>
          await this.blogDAO.getById(blogId, { notFound: true })
      ),
      author: parseIntSchema.external(
        async (userId: number) =>
          await this.userDAO.getById(userId, { notFound: true })
      )
    });
  }
}
