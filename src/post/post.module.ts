import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { Post } from 'src/entities/post.entity';
import { Tag} from 'src/entities/tag.entity'
import { User } from 'src/entities/user.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([ Post, Tag, User ]),
    UserModule
  ],
  controllers: [ PostController ],
  providers: [ PostService ]
})
export class PostModule {}
