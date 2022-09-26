import { Injectable } from "@nestjs/common";
import { BlogDTO } from "src/blog/dto";
import { JoiSchemaValidationPipe } from "src/joi/pipes";
import { BlogDTOJoiSchemaProvider as BlogDTOJoiSchemaProvider } from "../providers";

@Injectable()
export class UpdateBlogDTOValidationPipe extends JoiSchemaValidationPipe<
  BlogDTO,
  BlogDTO
> {
  constructor(blogDTOSchemaProvider: BlogDTOJoiSchemaProvider) {
    super(blogDTOSchemaProvider.schema);
  }
}
