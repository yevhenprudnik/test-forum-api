import { Controller, Get, Headers } from '@nestjs/common';
import { SystemInfo } from './decorators/system-info';
@Controller()
export class AppController {
  @Get()
  getHello(@SystemInfo() systemInfo) {
    return { greeting: 'Hell0, World!', systemInfo};
  }
}
