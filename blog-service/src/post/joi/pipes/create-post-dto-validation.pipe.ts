import { Injectable } from "@nestjs/common";
import { JoiSchemaValidationPipe } from "../../../joi/pipes";
import { PostDTO, TransformedPostDTO } from "../../dto";
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
