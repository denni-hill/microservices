import { ApiProperty } from "@nestjs/swagger";

export class PostDTO {
  @ApiProperty({ minLength: 2, maxLength: 500, example: "My post title" })
  title?: string;
  @ApiProperty({ minLength: 2, example: "My post content" })
  content?: string;
  author?: number | { id: number };
  blog?: number | { id: number };
  @ApiProperty({
    type: [Number],
    required: false,
    example: [1, 2, 3]
  })
  categories?: number[];
}
