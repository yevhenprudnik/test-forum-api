import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../entities/user.entity';
import { SessionHandler } from './handlers/session.handler';
import { Session } from 'src/entities/session.entity';
import { ConfigModule } from '@nestjs/config';
import { GoogleStrategy } from './oauth/google.strategy';
import { OauthService } from './oauth/oauth.service';
import { FacebookStrategy } from './oauth/facebook.strategy';
import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import { EmailHandler } from './handlers/mail.handler';
import { TokenAuthGuard } from './guards/token.auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath : '.env' }),
    TypeOrmModule.forFeature([ User, Session ]),
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
  providers: [ AuthService, SessionHandler, GoogleStrategy, FacebookStrategy, OauthService, EmailHandler ],
  controllers: [ AuthController ],
  exports: [ SessionHandler ]
})
export class AuthModule {}
