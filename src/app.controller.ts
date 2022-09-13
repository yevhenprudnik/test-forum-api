import { Controller, Get } from '@nestjs/common';
import { SystemInfo } from './decorators/user-agent.decorator';
@Controller()
export class AppController {
  @Get()
  getHello(@SystemInfo() systemInfo) {
    return { a: 'Hell0, World!', systemInfo};
  }
}
