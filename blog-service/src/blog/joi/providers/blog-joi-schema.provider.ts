import { Injectable } from "@nestjs/common";
import Joi, { ObjectSchema } from "joi";
import { BlogDTO } from "src/blog/dto";
import { JoiSchemaProvider } from "src/joi/providers";

@Injectable()
export class BlogJoiSchemaProvider implements JoiSchemaProvider {
  get schema(): ObjectSchema<any> {
    return Joi.object<BlogDTO, false, BlogDTO>({
      name: Joi.string().trim().min(1),
      description: Joi.string().trim().min(1)
    });
  }
}
