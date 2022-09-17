import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsBoolean,
  MinLength,
  MaxLength,
  Min
} from "class-validator";

export class CreateUserDTO {
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  authUserId: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(128)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(128)
  lastName: string;

  @IsBoolean()
  @IsNotEmpty()
  sex: boolean;
}
