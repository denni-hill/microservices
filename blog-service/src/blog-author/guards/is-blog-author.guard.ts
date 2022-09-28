import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserData } from "../../auth/dto";
import { BlogAuthorDAO } from "../../dao/blog-author.dao";

export const blogIdMetadataKey = "blog-id-key";

export const SetBlogIdParamKey = (key: string) =>
  SetMetadata(blogIdMetadataKey, key);

@Injectable()
export class IsBlogAuthorGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private blogAuthorDAO: BlogAuthorDAO
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as UserData;
    if (user.auth.is_admin === true) return true;

    const blogId = request.params[this.getBlogIdParamKey(context)];

    if (!(await this.blogAuthorDAO.isExistByBlogIdUserId(user.id, blogId)))
      throw new ForbiddenException("You are not allowed to post in this blog");

    return true;
  }

  getBlogIdParamKey(context: ExecutionContext): string {
    return this.reflector.get(blogIdMetadataKey, context.getClass());
  }
}
