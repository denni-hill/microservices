import { AuthGuard } from "@nestjs/passport";

export class JwtAuthRegisteredGuard extends AuthGuard("jwt-registered") {}
