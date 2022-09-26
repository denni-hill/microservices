import { Injectable } from "@nestjs/common";
import { JoiSchemaValidationPipe } from "../../../joi/pipes";
import { BlogDTO } from "../../dto";
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
