import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { UserData } from "../dto";

export const User = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as UserData;
  }
);
