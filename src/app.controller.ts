import { Controller, Get } from '@nestjs/common';
import { SystemInfo } from 'src/decorators/system-info';
@Controller()
export class AppController {
  @Get()
  getHello(@SystemInfo() systemInfo) {
    return { greeting: 'Hell0, World!', systemInfo};
  }
}
