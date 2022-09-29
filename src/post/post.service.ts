import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from 'src/entities/post.entity';
import { Tag } from 'src/entities/tag.entity';
import { User } from 'src/entities/user.entity';
import { DeepPartial, LessThan, Repository } from 'typeorm';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>
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
    .orderBy('post.createdAt', 'DESC')
    .take(limit)
    .getMany()

    if (posts.length < limit) {
      return { data: posts, next: null }
    }

    return { data: posts, next: posts[posts.length - 1].createdAt }
  }
  /**
   * @param  searchQuery
   * filters to find a post
   * @param  {Date} cursor
   * date before post was created(provided as next)
   * @param {number} limit
   * post objects quantity
   */
  async combinedSearch(searchQuery, cursor: Date, limit: number){

    const { tag, ...restFilters } = searchQuery;

    const searchPostsQuery = this.postRepository
    .createQueryBuilder('post')
    .where({ createdAt: LessThan(cursor), ...restFilters })
    if (tag) {
      searchPostsQuery
      .innerJoinAndSelect('post.tags','tags', 'tags.name = :name', {name: tag})
      .select(["post"]);
    }
    
    searchPostsQuery
    .orderBy('post.createdAt', 'DESC')
    .take(limit);

    const posts = await searchPostsQuery.getMany();

    if(!posts){
      return { data: [], next: null}
    }

    if (posts.length < limit) {
      return { data: posts, next: null }
    }

    return { data: posts, next: posts[posts.length - 1].createdAt }
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
  async editPost(id: number, userId: number, dataToEdit: DeepPartial<Post>): Promise<Post> {
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
