import { Tag } from 'src/entities/tag.entity';
import { BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export class TagService {
  constructor(
    @InjectRepository(Tag) 
    private readonly tagRepository: Repository<Tag>
  ) {}
  /**
   * @param  {string[]} tags
   * array of tags to manage
   * @returns Promise
   */
  async onCreatePost(tags: string[]): Promise<void> {
    for(const tag of tags){
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
    /**
   * @param  {string[]} tags
   * array of tags to manage
   * @returns Promise
   */
  async onDeletePost(tags: string[]): Promise<void> {
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