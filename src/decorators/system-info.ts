import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import * as parser  from 'ua-parser-js';

export const SystemInfo = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    
    const request = ctx.switchToHttp().getRequest();
    
    return parser(request.headers['user-agent']);
  },
);