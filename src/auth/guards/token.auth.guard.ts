import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { SessionService } from '../session.service';

@Injectable()
export class TokenAuthGuard implements CanActivate{

  constructor( private readonly sessionService: SessionService ){}

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

      const user = await this.sessionService.validateToken(accessToken);

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