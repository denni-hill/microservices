import { Injectable } from "@nestjs/common";
import { JoiSchemaValidationPipe } from "src/joi/pipes";
import { PostDTO, TransformedPostDTO } from "src/post/dto";
import { PostDTOJoiSchemaProvider } from "../providers";

@Injectable()
export class UpdatePostDTOValidationPipe extends JoiSchemaValidationPipe<
  PostDTO,
  TransformedPostDTO
> {
  constructor(postDTOSchemaProvider: PostDTOJoiSchemaProvider) {
    super(postDTOSchemaProvider.schema, {
      forbidden: {
        author: true,
        blog: true
      }
    });
  }
}
