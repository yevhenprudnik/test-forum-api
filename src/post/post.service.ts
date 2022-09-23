import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from 'src/entities/post.entity';
import { User } from 'src/entities/user.entity';
import { ArrayContains, DeepPartial, LessThan, MoreThan, Repository } from 'typeorm';
import { TagService } from './tag.service';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly tagService: TagService
  ){}
  /**
   * @param definition
   * post object
   * @param user
   * user object from request
   * @returns Promise
   */
  async createPost(definition: DeepPartial<Post>, user: DeepPartial<User>) : Promise<Post> {

    const { title, description, picture, coverPicture, tags } = definition;

    const newPost = this.postRepository.create({
      title, 
      description, 
      picture, 
      coverPicture, 
      tags,
      author: user,
      metadata:  {
        viewsCount: 0,
        likesCount: 0,
        savesCount: 0
      }
    });

    if(tags){
      await this.tagService.onCreatePost(tags);
    }

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
    .select(["post", "author.username"])
    .getOne();

    if (!post) {
      throw new NotFoundException("Post not found");
    }

    return post;
  }
  /**
   * @param  {string} username
   * @param  {Date} cursor
   * date before post was created(provided as next)
   * @param  {number} limit
   * post objects quantity
   */
  async getPostsByUser(username: string, cursor: Date, limit: number){
    
    const posts = await this.postRepository
    .createQueryBuilder("post")
    .innerJoinAndSelect(
      "post.author", "author", 
      "author.username =:username", 
      { username: username })
    .select(["post", "author.username"])
    .where({ createdAt: LessThan(cursor) })
    .orderBy("post.createdAt", "DESC")
    .take(limit)
    .getMany();

    if (posts.length < limit) {
      return { data: posts, next: null }
    }

    const res = { data: posts, next: posts[posts.length - 1].createdAt }

    return res;
  }
  /**
   * @param  {string} tag
   * tag to find posts
   * @param  {Date} cursor
   * date before post was created(provided as next)
   * @param  {number} limit
   * post objects quantity
   */
  async getPostsByTag(tag: string, cursor: Date, limit: number){
    
    const posts = await this.postRepository
    .find({
      relations: { author: true },
      select: { author: {
        username: true
      }},
      where: { tags: tag, createdAt: LessThan(cursor) },
      order: { createdAt: "DESC" },
      take: limit
    })

    if (posts.length < limit) {
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
  async editPost(id: number, userId: number, dataToEdit: DeepPartial<Post>) : Promise<Post> {

    const { title, description, picture, coverPicture, tags } = dataToEdit;

    const post = await this.postRepository.findOne({
      where: { id },
      relations : { author: true },  
      select: { author: {
        username: true,
        id: true 
      }},
    });
    if (!post) {
      throw new NotFoundException('Post is not found');
    }

    if(post.author.id !== userId) {
      throw new BadRequestException("Post can be edited only by it's author");
    }
    
    if (title) {
      post.title = title;
    }
    if(description) {
      post.description = description;
    }
    if (picture) {
      post.picture = picture;
    }
    if(coverPicture) {
      post.coverPicture = coverPicture;
    }
    if(tags){
      await this.tagService.onDeletePost(post.tags);
      await this.tagService.onCreatePost(tags);
      post.tags = tags;
    }

    return this.postRepository.save(post);
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

    const { tags } = post;

    const deleted = await this.postRepository.remove(post);

    if (deleted) {
      await this.tagService.onDeletePost(tags);
      return { deleted: true };
    }
    return { deleted: false };
  }

}
