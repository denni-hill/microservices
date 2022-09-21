import { IsInt, IsNotEmpty, Max, Min } from "class-validator";

export class PaginationOptions {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(200)
  count: number;
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  page: number;
}

export class DefaultPaginationOptions implements PaginationOptions {
  count = 20;
  page = 1;
}
