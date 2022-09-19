import { Controller, Get, Headers } from '@nestjs/common';
import { SystemInfo } from './decorators/user-agent.decorator';
@Controller()
export class AppController {
  @Get()
  getHello(@SystemInfo() systemInfo, @Headers('Authorization') headers) {
    console.log(headers);
    return { a: 'Hell0, World!', systemInfo, headers};
  }
}
