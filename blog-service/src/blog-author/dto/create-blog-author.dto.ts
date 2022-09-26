import { IsInt, IsNotEmpty, Min } from "class-validator";

export class BlogAuthorDTO {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  blogId: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  userId: number;
}
