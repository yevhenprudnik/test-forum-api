import { Controller, Get, Headers } from '@nestjs/common';
import * as parser  from 'ua-parser-js';
@Controller()
export class AppController {
  @Get()
  getHello(@Headers('User-Agent') headers) {
    const parsed = parser(headers);
    console.log(parsed);
    return parsed;
  }
}
