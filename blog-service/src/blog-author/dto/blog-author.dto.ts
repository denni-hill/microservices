import { ApiProperty } from "@nestjs/swagger";

export class BlogAuthorDTO {
  blog?: number | { id: number };
  @ApiProperty({
    type: Number,
    example: 1,
    description: "id"
  })
  user?: number | { id: number };
}
