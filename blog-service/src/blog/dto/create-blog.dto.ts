import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class CreateBlogDTO {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(1000)
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}
