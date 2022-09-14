import { User } from '../entities/user.entity';
import { Session } from '../entities/session.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { SessionHandler } from 'src/auth/handlers/session.handler';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath : '.env' }),
    TypeOrmModule.forFeature([ User ]),
    AuthModule
  ],
  controllers: [ UserController ],
  providers: [ UserService ]
})
export class UserModule {}
