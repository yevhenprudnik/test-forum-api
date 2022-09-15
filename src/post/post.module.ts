import { TagHandler } from './handlers/tag.handler';
import { forwardRef, Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Session } from 'src/entities/session.entity';
import { Post } from 'src/entities/post.entity';
import { Tag } from 'src/entities/tag.entity';
import { Like } from 'src/entities/like.entity';
import { Comment } from 'src/entities/comment.entity';
import { LikeModule } from 'src/like/like.module';
import { CommentModule } from 'src/comment/comment.module';

@Module({
  imports: [ 
    TypeOrmModule.forFeature([ User, Session, Post, Tag, Like, Comment ]),
    AuthModule, 
    UserModule,
    CommentModule,
    forwardRef(() => LikeModule)
  ],
  providers: [ PostService ],
  controllers: [ PostController ],
  exports: [ PostService ]
})
export class PostModule {}
