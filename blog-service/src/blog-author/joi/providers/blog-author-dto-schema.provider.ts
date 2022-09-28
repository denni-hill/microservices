import { Injectable } from "@nestjs/common";
import Joi, { ObjectSchema } from "joi";
import { BlogDAO } from "../../../dao/blog.dao";
import { UserDAO } from "../../../dao/user.dao";
import { parseIdSchema } from "../../../joi/customs";
import { JoiSchemaProvider } from "../../../joi/providers";
import { BlogAuthorDTO } from "../../dto";
import { TransformedBlogAuthorDTO } from "../../dto/transformed-blog-author.dto";

@Injectable()
export class BlogAuthorDTOSchemaProvider implements JoiSchemaProvider {
  constructor(private blogDAO: BlogDAO, private userDAO: UserDAO) {}
  get schema(): ObjectSchema<TransformedBlogAuthorDTO> {
    return Joi.object<TransformedBlogAuthorDTO, false, BlogAuthorDTO>({
      blog: parseIdSchema.external(async (blogId: number) => {
        if (blogId === undefined) return undefined;
        return await this.blogDAO.getById(blogId, { notFound: true });
      }),
      user: parseIdSchema.external(async (userId: number) => {
        if (userId === undefined) return undefined;
        return await this.userDAO.getById(userId, { notFound: true });
      })
    });
  }
}
