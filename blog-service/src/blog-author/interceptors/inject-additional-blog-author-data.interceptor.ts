import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { blogIdMetadataKey } from "../guards";

@Injectable()
export class InjectAdditionalBlogAuthorDataInterceptor
  implements NestInterceptor
{
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>
  ): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();

    request.body.blog = request.params[this.getBlogIdParamKey(context)];

    return next.handle();
  }

  getBlogIdParamKey(context: ExecutionContext): string {
    return this.reflector.get(blogIdMetadataKey, context.getHandler());
  }
}
