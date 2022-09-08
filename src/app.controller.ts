import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('user')
  async getHello(): Promise<object> {
    return this.appService.getUsers();
  }

  @Post('user')
  async createUser(@Body() body: Body): Promise<object> {
    const user = await this.appService.createUser(body);

    return user;
  }
}
