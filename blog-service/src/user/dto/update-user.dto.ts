import {
  IsNotEmpty,
  IsString,
  IsBoolean,
  MinLength,
  MaxLength,
  IsOptional
} from "class-validator";

export class UpdateUserDTO {
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

  @IsOptional()
  @IsBoolean()
  @IsNotEmpty()
  isAdmin?: boolean;
}
