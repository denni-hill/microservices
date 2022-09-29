import { Injectable } from "@nestjs/common";
import Joi, { ObjectSchema } from "joi";
import { BlogDAO } from "../../../dao/blog.dao";
import { CategoryDAO } from "../../../dao/category.dao";
import { UserDAO } from "../../../dao/user.dao";
import { parseIdSchema } from "../../../joi/customs";
import { JoiSchemaProvider } from "../../../joi/providers";
import { TransformedPostDTO, PostDTO } from "../../dto";

@Injectable()
export class PostDTOJoiSchemaProvider implements JoiSchemaProvider {
  constructor(
    private blogDAO: BlogDAO,
    private userDAO: UserDAO,
    private categoryDAO: CategoryDAO
  ) {}

  get schema(): ObjectSchema<TransformedPostDTO> {
    return Joi.object<TransformedPostDTO, true, PostDTO>({
      title: Joi.string().trim().min(2).max(500),
      content: Joi.string().trim().min(2),
      blog: parseIdSchema.external(async (blogId: number) => {
        if (blogId === undefined) return undefined;
        return await this.blogDAO.getById(blogId, { notFound: true });
      }),
      author: parseIdSchema.external(async (userId: number) => {
        if (userId === undefined) return undefined;
        return await this.userDAO.getById(userId, { notFound: true });
      }),
      categories: Joi.array()
        .items(Joi.string().trim().min(1).max(256))
        .custom((stringCategories: string[]) => [
          ...new Set<string>(stringCategories)
        ])
        .max(20)
        .custom((stringCategories: string[]) =>
          stringCategories.map((name) =>
            this.categoryDAO.createEntity({ name })
          )
        )
    });
  }
}
