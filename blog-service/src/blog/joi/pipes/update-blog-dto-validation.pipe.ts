import { Injectable } from "@nestjs/common";
import { JoiSchemaValidationPipe } from "../../../joi/pipes";
import { BlogDTO } from "../../dto";
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
