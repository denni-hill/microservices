import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UnauthorizedException
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { blogIdMetadataKey } from "../../blog-author/guards";

@Injectable()
export class InjectAdditionalBlogPostDataInterceptor
  implements NestInterceptor
{
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>
  ): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    if (request.user === undefined) throw new UnauthorizedException();

    request.body.author = request.user.id;
    request.body.blog = request.params[this.getBlogIdParamKey(context)];

    return next.handle();
  }

  getBlogIdParamKey(context: ExecutionContext): string {
    return this.reflector.get(blogIdMetadataKey, context.getClass());
  }
}
