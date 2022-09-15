import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { Comment } from 'src/entities/comment.entity';
import { Like } from 'src/entities/like.entity';
import { Post } from 'src/entities/post.entity';
import { Session } from 'src/entities/session.entity';
import { User } from 'src/entities/user.entity';
import { LikeModule } from 'src/like/like.module';
import { PostModule } from 'src/post/post.module';
import { UserModule } from 'src/user/user.module';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ User, Session, Post, Like, Comment ]),
    AuthModule, 
    UserModule,
    forwardRef(() => PostModule),
    forwardRef(() => LikeModule)
  ],
  controllers: [ CommentController ],
  providers: [ CommentService ],
  exports: [ CommentService ]
})
export class CommentModule {}
