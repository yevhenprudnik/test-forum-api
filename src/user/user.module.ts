import { User } from '../entities/user.entity';
import { Session } from '../entities/session.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { SessionHandler } from 'src/auth/handlers/session.handler';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath : '.env' }),
    TypeOrmModule.forFeature([ User, Session ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET
    })
  ],
  controllers: [ UserController ],
  providers: [ UserService, SessionHandler ]
})
export class UserModule {}
