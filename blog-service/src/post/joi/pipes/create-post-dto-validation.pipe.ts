import { Injectable } from "@nestjs/common";
import { JoiSchemaValidationPipe } from "src/joi/pipes";
import { PostDTO, TransformedPostDTO } from "src/post/dto";
import { PostDTOJoiSchemaProvider } from "../providers";

@Injectable()
export class CreatePostDTOValidationPipe extends JoiSchemaValidationPipe<
  PostDTO,
  TransformedPostDTO
> {
  constructor(postDTOSchemaProvider: PostDTOJoiSchemaProvider) {
    super(postDTOSchemaProvider.schema, {
      required: {
        title: true,
        content: true,
        blog: true,
        author: true
      }
    });
  }
}
