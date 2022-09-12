import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { SessionHandler } from '../handlers/session.handler';

@Injectable()
export class TokenAuthGuard implements CanActivate{

  constructor( private readonly sessionHandler : SessionHandler ){}

  async canActivate( context: ExecutionContext){
    const request = context.switchToHttp().getRequest();
    try {
      const authHeader = request.headers.authorization;

      const bearer = authHeader.split(" ")[0];
      const accessToken = authHeader.split(" ")[1]; 

      if (bearer !== 'Bearer' || !accessToken) {
        throw new UnauthorizedException('Token is not valid');
      }

      const user = await this.sessionHandler.validateToken(accessToken);

      if (!user) {
        throw new UnauthorizedException('Token is not valid');
      }
      request.user = user;
      return true;

    } catch (error) {
      throw new UnauthorizedException('Token is not valid');
    }
  }
}