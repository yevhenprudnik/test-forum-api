import { Tag } from '../../entities/tag.entity';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';


export class TagHandler {
  constructor(
    @InjectRepository(Tag) 
    private readonly tagRepository: Repository<Tag>
  ) {}

  async onCreatePost(tags: string[]){
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

  async onDeletePost(tags: string[]){
    for( const tag of tags ){
      const tagFromDb = await this.tagRepository.findOneBy({ name: tag});
      if (!tagFromDb) {
        throw new BadRequestException('Failed to delete tag')
      }
      tagFromDb.postsCount--;
      if (tagFromDb.postsCount <= 0) {
        await this.tagRepository.remove(tagFromDb);
      } else {
        await this.tagRepository.save(tagFromDb);
      }
    }
  }

}