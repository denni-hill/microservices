import { Injectable } from "@nestjs/common";
import { JoiSchemaValidationPipe } from "../../../joi/pipes";
import { BlogAuthorDTO } from "../../dto";
import { TransformedBlogAuthorDTO } from "../../dto/transformed-blog-author.dto";
import { BlogAuthorDTOSchemaProvider } from "../providers";

@Injectable()
export class CreateBlogAuthorDTOValidationPipe extends JoiSchemaValidationPipe<
  BlogAuthorDTO,
  TransformedBlogAuthorDTO
> {
  constructor(blogAuthorDTOSchemaProvider: BlogAuthorDTOSchemaProvider) {
    super(blogAuthorDTOSchemaProvider.schema, {
      required: {
        blog: true,
        user: true
      }
    });
  }
}
