import { Injectable } from "@nestjs/common";
import { BlogDTO } from "src/blog/dto";
import { JoiSchemaValidationPipe } from "src/joi/pipes";
import { BlogJoiSchemaProvider } from "../providers/blog-joi-schema.provider";

@Injectable()
export class CreateBlogDTOValidationPipe extends JoiSchemaValidationPipe<
  BlogDTO,
  BlogDTO
> {
  constructor(blogSchemaProvider: BlogJoiSchemaProvider) {
    super(blogSchemaProvider.schema, { name: true, description: true });
  }
}
