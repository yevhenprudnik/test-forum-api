import {  Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from 'src/entities/tag.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ){}
  /**
   * @param  searchQuery
   * filters to find a post
   * @param  {Date} cursor
   * date before post was created(provided as next)
   * @param {number} limit
   * post objects quantity
   */
  async getPostsByTag(searchQuery, cursor: Date, limit: number){
    
    const { tag, ...restFilters } = searchQuery;
    
    const tagData = await this.tagRepository
    .createQueryBuilder('tag')
    .where({ name: tag, ...restFilters })
    .innerJoinAndSelect('tag.posts','posts')
    .andWhere("posts.createdAt < :cursorDate", { cursorDate: cursor })
    .select(["tag", "posts"])
    .orderBy('posts.createdAt', 'DESC')
    .limit(limit)
    .getOne()

    if (!tagData || !tagData.posts) {
      return { data: [], next: null }
    }
    
    const { posts } = tagData;

    if( posts.length < limit){
      return { data: posts, next: null }
    }

    return { data: posts, next: posts[posts.length - 1].createdAt };
  }

}
