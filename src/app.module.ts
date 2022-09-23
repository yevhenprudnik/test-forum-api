import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { UserModule } from './auth/user.module';
import { Post } from './entities/post.entity';
import { Session } from './entities/session.entity';
import { Tag } from './entities/tag.entity';
import { User } from './entities/user.entity';
import { PostModule } from './post/post.module';

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
      entities: [ User, Session, Post, Tag ],
      synchronize: true,
      logging: false,
    }),
    UserModule,
    PostModule,
  ],
  controllers: [ AppController ],
})
export class AppModule {}
