import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/auth/user.module';
import { Post } from 'src/entities/post.entity';
import { Tag} from 'src/entities/tag.entity'
import { TagService } from './tag.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([ Post, Tag ]),
    UserModule
  ],
  controllers: [ PostController ],
  providers: [ PostService, TagService]
})
export class PostModule {}
