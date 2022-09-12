import { Controller, Get, Req } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello(@Req() request): string {
    console.log(request);
    return 'Hell0, world!'
  }
}
