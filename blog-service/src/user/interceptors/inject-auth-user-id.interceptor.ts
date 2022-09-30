import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UnauthorizedException
} from "@nestjs/common";
import { Observable } from "rxjs";
import { UserData } from "../../auth/dto";

@Injectable()
export class InjectAuthUserIdInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>
  ): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as UserData;

    if (user === undefined) throw new UnauthorizedException();

    request.body.authUserId = user.auth.id;

    return next.handle();
  }
}
