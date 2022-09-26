import { Injectable } from "@nestjs/common";
import { JoiSchemaValidationPipe } from "src/joi/pipes";
import { PostDTO, TransformedPostDTO } from "src/post/dto";
import { PostJoiSchemaProvider } from "../providers/post-joi-schema.provider";

@Injectable()
export class CreatePostValidationPipe extends JoiSchemaValidationPipe<
  PostDTO,
  TransformedPostDTO
> {
  constructor(postSchemaProvier: PostJoiSchemaProvider) {
    super(postSchemaProvier.schema, {
      title: true,
      content: true,
      blog: true,
      author: true
    });
  }
}
