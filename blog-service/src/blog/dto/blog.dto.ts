import { ApiProperty } from "@nestjs/swagger";

export class BlogDTO {
  @ApiProperty({ example: "My blog" })
  name?: string;
  @ApiProperty({ example: "My blog description" })
  description?: string;
}
