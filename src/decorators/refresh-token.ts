import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

export const RefreshToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    let refreshToken = request.cookies.refreshToken;
    if (refreshToken) {
      return refreshToken;
    }
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Token is not valid');
    }
    refreshToken = authHeader.split(" ")[2];
    if (!refreshToken) {
      throw new UnauthorizedException('Token is not valid');
    }

    return refreshToken;
  },
);