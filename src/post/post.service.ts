import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentService } from 'src/comment/comment.service';
import { Post } from 'src/entities/post.entity';
import { User } from 'src/entities/user.entity';
import { LikeService } from 'src/like/like.service';
import { ArrayContains, DeepPartial, Repository } from 'typeorm';
import { TagHandler } from './handlers/tag.handler';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post) 
    private readonly postRepository: Repository<Post>, 
    private readonly tagHandler: TagHandler,
    @Inject(forwardRef(() => LikeService)) private likeService: LikeService,
    @Inject(forwardRef(() => CommentService)) private commentService: CommentService
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
        viewsCount: 0,
        likesCount: 0,
        savesCount: 0
      }
    });

    if (tags) {
      await this.tagHandler.onCreatePost(tags);
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
      relations: {
        author: true
      },
      select: {
        author: {
          username : true
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

  async handlePostLike(post: Post, action: string){
    if (action === 'addLike') {
      post.cacheData.likesCount++;
      await this.postRepository.save(post);
    } else if (action === 'removeLike') {
      post.cacheData.likesCount--;
      await this.postRepository.save(post);
    }
  }

  async editPost(postId: number, userId: number, dataToEdit: DeepPartial<Post>) {

    const { title, description, picture, coverPicture, tags } = dataToEdit;

    const post = await this.postRepository.findOne({
    where: { id: postId },
    relations : { author: true },  
    select: { author: {
      username: true,
      id: true 
    }},
  });
    if (!post) {
      throw new NotFoundException('Post is not found');
    };
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
    if (tags) {
      await this.tagHandler.onDeletePost(post.tags);
      post.tags = tags;
      await this.tagHandler.onCreatePost(tags)
    }
    return this.postRepository.save(post);
  }

  async deletePost(postId: number, userId: number) {
    const post = await this.postRepository.findOne({
    where: { id: postId },
    relations : { author: true },  
  });
    if (!post) {
      throw new NotFoundException('Post is not found');
    };
    if(post.author.id !== userId) {
      throw new BadRequestException("Post can be deleted only by it's author");
    }
    const tags = post.tags;

    await this.likeService.onRemoveParent('post', post.id);
    await this.commentService.onRemoveParent('post', post.id);

    const deleted = await this.postRepository.remove(post);
    if (deleted) {
      await this.tagHandler.onDeletePost(tags);
      return { deleted: true };
    }
    return { deleted: false };
  }
}
