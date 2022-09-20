import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { Session } from './entities/session.entity';
import { User } from './entities/user.entity';
import { UserModule } from './user/user.module';

@Module({
  imports: [ 
    ConfigModule.forRoot({ envFilePath : '.env' }),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DB_HOST,
      port: +process.env.DATABASE_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [ User, Session ],
      synchronize: true,
      logging: false,
    }),
    UserModule,
    AuthModule,
  ],
  controllers: [ AppController ],
})
export class AppModule {}
