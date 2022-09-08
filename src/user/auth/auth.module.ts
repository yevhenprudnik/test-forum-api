import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './auth.service';
import { UsersController } from './auth.controller';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [ UsersService ],
  controllers: [ UsersController ],
})
export class UsersModule {}
