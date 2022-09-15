import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { Comment } from 'src/entities/comment.entity';
import { Like } from 'src/entities/like.entity';
import { Post } from 'src/entities/post.entity';
import { Session } from 'src/entities/session.entity';
import { User } from 'src/entities/user.entity';
import { LikeModule } from 'src/like/like.module';
import { UserModule } from 'src/user/user.module';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';

@Module({
  controllers: [ CommentController ],
  providers: [ CommentService ],
  imports: [
    TypeOrmModule.forFeature([ User, Session, Post, Like, Comment ]),
    AuthModule, 
    UserModule,
    forwardRef(() => LikeModule)
  ],
  exports: [ CommentService ]
})
export class CommentModule {}
