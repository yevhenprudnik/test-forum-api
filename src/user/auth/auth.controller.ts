import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { User } from './entities/user.entity';
import { UsersService } from './auth.service';

@Controller('users-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(@Body() userDto: RegisterDto){
    return this.usersService.register(userDto);
  }

  @Post('logIn')
  async logIn(@Body() userDto: LoginDto){
    return this.usersService.logIn(userDto);
  }

  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(id);
  }
}