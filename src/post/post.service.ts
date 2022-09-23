import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from 'src/entities/post.entity';
import { User } from 'src/entities/user.entity';
import { ArrayContains, DeepPartial, Repository } from 'typeorm';
import { TagService } from './tag.service';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly tagService: TagService
  ){}
  /**
   * @param  {DeepPartial<Post>} postDefinition
   * post dto
   * @param  {DeepPartial<User>} user
   * user from req
   */
  async createPost(postDefinition: DeepPartial<Post>, user: DeepPartial<User>) : Promise<Post> {

    const { title, description, picture, coverPicture, tags } = postDefinition;

    const newPost = this.postRepository.create({
      title, 
      description, 
      picture, 
      coverPicture, 
      tags,
      author: user,
      cacheData:  {
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
   * @param  {number} page
   * pagination page number
   * @returns Promise
   * array of posts
   */
  async getAllPost(page: number): Promise<Post[]>{
    const postPerPage = 20;

    const posts = await this.postRepository
    .find({
      order: { createdAt: "DESC" },
      relations: ['author'],
      select: {
        author : {
          username: true,
        }
      },
      skip: postPerPage*page,
      take: postPerPage
    })

    if (!posts.length) {
      throw new NotFoundException("There are no posts yet");
    }
    return posts;
  }
  /**
   * @param  {string} username
   * @param  {number} page
   * @returns Promise
   * array of posts
   */
  async getPostsByUser(username: string, page: number) : Promise<Post[]>{
    const postPerPage = 20;
    
    const posts = await this.postRepository
    .createQueryBuilder("post")
    .innerJoinAndSelect(
      "post.author", "author", 
      "author.username =:username", 
      { username: username })
    .select(["post", "author.username"])
    .orderBy("post.createdAt", "DESC")
    .skip(postPerPage*page)
    .take(postPerPage)
    .getMany();

    if (!posts.length) {
      throw new NotFoundException(`User ${username} does not have posts yet`);
    }

    return posts;
  }
  /**
   * @param  {string} tag
   * tags to find posts
   * @param  {number} page?
   */
  async getPostsByTag(tag: string, page: number){
    const postPerPage = 20;

    const posts = await this.postRepository
    .find({
      relations: { author: true },
      select: { author: {
        username: true
      }},
      where: { tags: ArrayContains([tag]) },
      order: { createdAt: "DESC" },
      skip: postPerPage*page,
      take: postPerPage
    })

    if (!posts.length) {
      throw new NotFoundException(`Tad ${tag} does not exist yet`);
    }

    return posts;
  }
  /**
   * @param  {number} id
   * post id
   * @param  {number} userId
   * user id
   * @param  {DeepPartial<Post>} dataToEdit
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
