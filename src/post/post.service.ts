import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from 'src/entities/post.entity';
import { User } from 'src/entities/user.entity';
import { ArrayContains, DeepPartial, Repository } from 'typeorm';
import { TagHandler } from './handlers/tag.handler';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post) 
    private readonly postRepository: Repository<Post>, 
    private readonly tagHandler: TagHandler
  ){}

  async createPost(postDefinition: DeepPartial<Post>, user: DeepPartial<User>){
    const { title, description, picture, coverPicture, tags } = postDefinition;

    if (!title || !description ) {
      throw new BadRequestException("Wrong credentials")
    }

    const newPost = this.postRepository.create({
      title, description, picture, coverPicture, tags,
      author: user,
      cacheData:  {
        viewsCount : 0,
        likesCount: 0,
        savesCount: 0
      }
    });

    if (tags) {
      await this.tagHandler.manageTags(tags);
    }

    await this.postRepository.save(newPost);
    return newPost;
  }

  async getPostById(id: number){

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

  async getAllPost(page: number){
    const postPerPage = 20;
    const posts = await this.postRepository.find({
      order: { createdAt: "DESC" },
      skip: postPerPage*page,
      take: postPerPage
    })
    if (!posts.length) {
      throw new NotFoundException("There are no posts yet");
    }
    return posts;
  }

  async getPostByUser(username: string, page: number){
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

  async getPostsByTag(tag: string, page? :number){
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
}
