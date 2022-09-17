import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsBoolean,
  MinLength,
  MaxLength,
  Min,
  IsOptional
} from "class-validator";

export class UpdateUserDTO {
  @IsOptional()
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  authUserId?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(128)
  firstName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(128)
  lastName?: string;

  @IsOptional()
  @IsBoolean()
  @IsNotEmpty()
  sex?: boolean;
}
