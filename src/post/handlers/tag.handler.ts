import { Tag } from './../../entities/tag.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';

@Injectable()
export class TagHandler {
  constructor(
    @InjectRepository(Tag) 
    private readonly tagRepository: Repository<Tag>
  ) {}

  async manageTags(tags: string[]){
    for( const tag of tags ){
    const tagFromDb = await this.tagRepository.findOneBy({ name: tag});

    if (tagFromDb) {
      tagFromDb.postsCount++;
      await this.tagRepository.save(tagFromDb);
    } else {
        const newTag = this.tagRepository.create({
          name: tag,
          followersCount: 0,
          postsCount: 1
        });
        await this.tagRepository.save(newTag);
      }
    }
  }

}