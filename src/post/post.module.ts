import { TagHandler } from './handlers/tag.handler';
import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Session } from 'src/entities/session.entity';
import { Post } from 'src/entities/post.entity';
import { Tag } from 'src/entities/tag.entity';

@Module({
  imports: [ 
    TypeOrmModule.forFeature([ User, Session, Post, Tag ]),
    AuthModule, 
    UserModule ],
  providers: [ PostService, TagHandler ],
  controllers: [ PostController ]
})
export class PostModule {}
