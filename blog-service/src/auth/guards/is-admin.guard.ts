import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import { Observable } from "rxjs";
import { UserData } from "../dto";

@Injectable()
export class IsAdminGuard implements CanActivate {
  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const user = context.switchToHttp().getRequest().user as UserData;
    if (user === undefined) throw new UnauthorizedException();

    return user.isAdmin === true;
  }
}
