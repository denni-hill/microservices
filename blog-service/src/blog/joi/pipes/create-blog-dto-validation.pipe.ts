import { Injectable } from "@nestjs/common";
import { BlogDTO } from "src/blog/dto";
import { JoiSchemaValidationPipe } from "src/joi/pipes";
import { BlogDTOJoiSchemaProvider } from "../providers/blog-dto-joi-schema.provider";

@Injectable()
export class CreateBlogDTOValidationPipe extends JoiSchemaValidationPipe<
  BlogDTO,
  BlogDTO
> {
  constructor(blogDTOSchemaProvider: BlogDTOJoiSchemaProvider) {
    super(blogDTOSchemaProvider.schema, {
      required: { name: true, description: true }
    });
  }
}
