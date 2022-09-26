import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SearchQuery } from 'src/dtos/serachQuery.dto';
import { Post } from 'src/entities/post.entity';
import { Tag } from 'src/entities/tag.entity';
import { User } from 'src/entities/user.entity';
import { DeepPartial, LessThan, Repository } from 'typeorm';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ){}
  /**
   * @param definition
   * post object
   * @param user
   * user object from request
   * @returns Promise
   */
  async createPost(definition: DeepPartial<Post>, user: DeepPartial<User>) : Promise<Post> {

    const newPost = this.postRepository.create({
      ...definition,
      author: user,
      metadata:  {
        viewsCount: 0,
        likesCount: 0,
        savesCount: 0
      }
    });

    return this.postRepository.save(newPost);
  }
  /**
   * @param  {number} id
   * post id
   * @returns Promise
   * post object
   */
  async getPostById(id: number) : Promise<Post> {

    const post = await this.postRepository
    .createQueryBuilder("post")
    .where({id : id})
    .innerJoinAndSelect("post.author", "author")
    .innerJoinAndSelect("post.tags", "tags")
    .select(["post", "author.username", "tags"])
    .getOne();

    if (!post) {
      throw new NotFoundException("Post not found");
    }

    return post;
  }
  /**
   * @param  {string} tag
   * tag to find posts
   * @param  {Date} cursor
   * date before post was created(provided as next)
   * @param  {number} limit
   * post objects quantity
   */
  async getPosts(searchQuery, cursor: Date, limit: number){
    
    const posts = await this.postRepository
    .createQueryBuilder('post')
    .where({ createdAt: LessThan(cursor), ...searchQuery })
    .innerJoinAndSelect('post.author','author')
    .innerJoinAndSelect('post.tags','tags')
    .select(["post", "author.username", "tags"])
    .getMany()

    if (!posts || posts.length < limit) {
      return { data: posts, next: null }
    }

    const res = { data: posts, next: posts[posts.length - 1].createdAt }

    return res;
  }

  async getPostsByTag(searchQuery, cursor: Date, limit: number){
    
    const { tag, ...restFilters } = searchQuery;
    
    const tagData = await this.tagRepository
    .createQueryBuilder('tag')
    .where({ name: tag, ...restFilters })
    .innerJoinAndSelect('tag.posts','posts')
    .innerJoinAndSelect('posts.author','author')
    .andWhere("posts.createdAt < :cursorDate", { cursorDate: cursor })
    .orderBy('posts.createdAt', 'DESC')
    .select(["tag", "author.username", "posts"])
    .limit(limit)
    .getOne()

    const { posts } = tagData;

    if (!posts || posts.length < limit) {
      return { data: posts, next: null }
    }

    const res = { data: posts, next: posts[posts.length - 1].createdAt }

    return res;
  }
  /**
   * @param  {number} id
   * post id
   * @param  {number} userId
   * user id
   * @param dataToEdit
   * post object fields to edit
   * @returns Promise
   * post object
   */
  async editPost(id: number, userId: number, dataToEdit: DeepPartial<Post>) {
    try {
      const post = await this.postRepository.findOne({
        where: { id },
        relations : { 
          author: true, 
          tags: true 
        }
      });

      if (!post) {
        throw new NotFoundException('Post is not found')
      }
      if (post.author.id !== userId) {
        throw new ForbiddenException("Post can be modified only by it's author")
      }

      const { tags, ...otherData } = dataToEdit;
      
      const updatedTags = tags.map(tag => {
        const newTag = new Tag();
        newTag.name = tag.name;
        return newTag;
      })
      
      post.tags = updatedTags;

      for (const key in otherData) {
        post[key] = otherData[key];
      }

      return this.postRepository.save(post);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
  /**
   * @param  {number} id
   * post id
   * @param  {number} userId
   * user id
   */
  async deletePost(id: number, userId: number){
    const post = await this.postRepository.findOne({
    where: { id },
    relations : { author: true },  
    });

    if (!post) {
      throw new NotFoundException('Post is not found');
    }

    if(post.author.id !== userId) {
      throw new BadRequestException("Post can be deleted only by it's author");
    }

    const deleted = await this.postRepository.remove(post);

    if (deleted) {
      return { deleted: true };
    }
    return { deleted: false };
  }

}
