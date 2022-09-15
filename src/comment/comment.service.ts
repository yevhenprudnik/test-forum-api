import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from 'src/entities/comment.entity';
import { Post } from 'src/entities/post.entity';
import { User } from 'src/entities/user.entity';
import { LikeService } from 'src/like/like.service';
import { PostService } from 'src/post/post.service';
import { Repository } from 'typeorm';

@Injectable()
export class CommentService { 
  constructor(
    private readonly postService: PostService,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    private readonly likeService: LikeService
  ){}

  async addComment(targetType: string, targetId: number, user: User, text: string){
    if(targetType !== 'comment' && targetType !== 'post'){
      throw new BadRequestException('Only post and comments can be commented');
    }
    if (targetType === 'comment') {
      const comment = await this.commentRepository.findOneBy({ id: targetId});
      if(!comment) {
        throw new NotFoundException("Comment not found");
      }

      const newComment = this.commentRepository.create({
        commentableType: 'comment',
        text: text,
        commentReply: comment,
        author: user
      });

      await this.commentRepository.save(newComment);

      return { message: 'Comment added successfully', comment: newComment };
    } else {
      const post = await this.postRepository.findOneBy({ id: targetId });

      if(!post) {
        throw new NotFoundException("Post not found");
      }

      const newComment = this.commentRepository.create({
        commentableType: 'post',
        text: text,
        post: post,
        author: user
      });

      await this.commentRepository.save(newComment);

      return { message: 'Comment added successfully', post: newComment };
    }
  }

  async getTargetComments(targetType: string, targetId: number, page: number){
    if(targetType !== 'comment' && targetType !== 'post'){
      throw new BadRequestException('Only post and comments have comments');
    }
    const commentPerPage = 50;
    let parent = "post";
    if(targetType === 'comment'){
      parent = 'commentReply'
    }

    const comments = await this.commentRepository
      .createQueryBuilder("comment")
      .where({ commentableType: parent })
      .innerJoinAndSelect(`comment.${parent}`, "parent", "parent.id =:parentId", { parentId: targetId})
      .innerJoinAndSelect("comment.author", "author")
      .select(["comment", "parent", "author.username"])
      .skip(commentPerPage*page)
      .take(commentPerPage)
      .getMany()

    return comments
  }

  async removeComment(targetType: string, targetId: number, user: User){
    if(targetType !== 'comment' && targetType !== 'post'){
      throw new BadRequestException('Only post and comments have comments');
    }

    let parent = "post";
    if(targetType === 'comment'){
      parent = 'commentReply'
    }

    const comment = await this.commentRepository
      .createQueryBuilder("comment")
      .where({ commentableType: targetType })
      .innerJoinAndSelect(`comment.${parent}`, "parent", "parent.id =:parentId", { parentId: targetId})
      .innerJoinAndSelect("comment.author", "author", "author.id =:authorId", { authorId: user.id})
      .getOne()


    if (!comment) {
      throw new NotFoundException("Comment not found");
    }

    await this.likeService.onRemoveParent('comment', comment.id);

    await this.onRemoveParent('commentReply', comment.id);

    await this.commentRepository.remove(comment);

    return { message: 'Comment removed successfully', comment: comment };
  }


  async onRemoveParent(parentType: string, parentId: number){
    const comments = await this.commentRepository
      .createQueryBuilder("comment")
      .where({ commentableType: parentType })
      .innerJoinAndSelect(`comment.${parentType}`, "parent", "parent.id =:parentId", { parentId: parentId})
      .getMany()

    if (!comments.length) {
      return null;
    }
    for(const comment of comments) { 
      await this.likeService.onRemoveParent('comment', comment.id);
    }

    await this.commentRepository.remove(comments);
  }

}

