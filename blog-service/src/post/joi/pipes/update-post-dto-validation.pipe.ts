import { Injectable, UnprocessableEntityException } from "@nestjs/common";
import { JoiSchemaValidationPipe } from "../../../joi/pipes";
import { PostDTO, TransformedPostDTO } from "../../dto";
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

  async transform(value: PostDTO): Promise<TransformedPostDTO> {
    try {
      return await this.schema.validateAsync(value, this.options);
    } catch (e) {
      console.dir(e, { depth: null });
      throw new UnprocessableEntityException(e.details);
    }
  }
}
