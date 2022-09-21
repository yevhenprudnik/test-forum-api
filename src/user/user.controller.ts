import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { TokenAuthGuard } from 'src/auth/guards/token.auth.guard';
import { User } from 'src/entities/user.entity';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor( private userService: UserService){}

  @UseGuards(TokenAuthGuard)
  @Get('users')
  getUsers(): Promise<User[]> {
    return this.userService.findAll()
  }

  @UseGuards(TokenAuthGuard)
  @Get('/:username')
  getUser(@Param('username') username: string): Promise<User>{
    return this.userService.getUser(username);
  }

}

