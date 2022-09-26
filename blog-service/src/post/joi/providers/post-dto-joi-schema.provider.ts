import { Injectable } from "@nestjs/common";
import Joi, { ObjectSchema } from "joi";
import { BlogDAO } from "../../../dao/blog.dao";
import { UserDAO } from "../../../dao/user.dao";
import { parseIntSchema } from "../../../joi/customs";
import { JoiSchemaProvider } from "../../../joi/providers";
import { TransformedPostDTO, PostDTO } from "../../dto";

@Injectable()
export class PostDTOJoiSchemaProvider implements JoiSchemaProvider {
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
