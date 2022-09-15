import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { CommentModule } from 'src/comment/comment.module';
import { Comment } from 'src/entities/comment.entity';
import { Like } from 'src/entities/like.entity';
import { Post } from 'src/entities/post.entity';
import { Session } from 'src/entities/session.entity';
import { User } from 'src/entities/user.entity';
import { PostModule } from 'src/post/post.module';
import { UserModule } from 'src/user/user.module';
import { LikeController } from './like.controller';
import { LikeService } from './like.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ User, Session, Post, Like, Comment ]),
    AuthModule, 
    UserModule,
    forwardRef(() => PostModule),
    CommentModule
  ],
  providers: [ LikeService ],
  controllers: [ LikeController ],
  exports: [ LikeService ]
})
export class LikeModule {}
