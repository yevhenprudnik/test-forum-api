import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from '../entities/user.entity';
import { SessionService } from './session.service';
import { Session } from 'src/entities/session.entity';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import { EmailHandler } from './handlers/mail.handler';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath : '.env' }),
    TypeOrmModule.forFeature([ User, Session ]),
    HttpModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET
    }),
    MailerModule.forRoot({
      transport: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
        }
      },
      template: {
        dir: __dirname + '/templates',
        adapter: new PugAdapter(),
        options: {
          strict: true,
        },
      },
    })
],
  providers: [ 
    UserService,
    SessionService, 
    EmailHandler
  ],
  controllers: [ UserController ],
  exports: [ SessionService ]
})
export class UserModule {}
