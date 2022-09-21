import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { SessionHandler } from '../handlers/session.handler';

@Injectable()
export class TokenAuthGuard implements CanActivate{

  constructor( private readonly sessionHandler : SessionHandler ){}

  async canActivate( context: ExecutionContext){
    const request = context.switchToHttp().getRequest();
    try {
      let accessToken = request.cookies.accessToken;
      const authHeader = request.headers.authorization;
      
      if(!accessToken){
        const authHeaders = authHeader.split(" "); 
        if (!authHeader.startsWith('Bearer') || !authHeaders[1]) {
          throw new UnauthorizedException('Token is not valid');
        }
        accessToken = authHeaders[1];
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