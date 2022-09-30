import { ApiProperty } from "@nestjs/swagger";

export class UpdateUserDTO {
  @ApiProperty({ example: "John" })
  firstName?: string;
  @ApiProperty({ example: "Doe" })
  lastName?: string;
  @ApiProperty({ description: "true for male, false for female" })
  sex?: boolean;
}
