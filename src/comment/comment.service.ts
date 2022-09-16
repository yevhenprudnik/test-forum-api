import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from 'src/entities/comment.entity';
import { Post } from 'src/entities/post.entity';
import { User } from 'src/entities/user.entity';
import { LikeService } from 'src/like/like.service';
import { DeepPartial, Repository } from 'typeorm';

@Injectable()
export class CommentService { 
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    private readonly likeService: LikeService
  ){}

  async addComment(targetType: string, targetId: number, user: User, comment: DeepPartial<Comment>){
    if(targetType !== 'comment' && targetType !== 'post'){
      throw new BadRequestException('Only post and comments can be commented');
    }
    if (targetType === 'comment') {
      const commentFromDb = await this.commentRepository.findOneBy({ id: targetId});
      if(!comment) {
        throw new NotFoundException("Comment not found");
      }

      const newComment = this.commentRepository.create({
        commentableType: 'comment',
        text: comment.text,
        commentReply: commentFromDb,
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
        text: comment.text,
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
      .where({ commentableType: targetType })
      .innerJoinAndSelect(`comment.${parent}`, "parent", "parent.id =:parentId", { parentId: targetId})
      .innerJoinAndSelect("comment.author", "author")
      .select(["comment", "parent", "author.username"])
      .skip(commentPerPage*page)
      .take(commentPerPage)
      .getMany()

      console.log(comments)

    return comments
  }

  async removeComment(commentId: number, user: User){

    const comment = await this.commentRepository
      .createQueryBuilder("comment")
      .where({ id: commentId })
      .innerJoinAndSelect("comment.author", "author", "author.id =:authorId", { authorId: user.id})
      .getOne()

    if (!comment) {
      throw new NotFoundException("Comment not found");
    }

    await this.likeService.onRemoveParent('comment', comment.id);

    await this.onRemoveParent('comment', comment.id);

    await this.commentRepository.remove(comment);

    return { message: 'Comment removed successfully', comment: comment };
  }


  async onRemoveParent(parentType: string, parentId: number){
    let parent = "post";
    if(parentType === 'comment'){
      parent = 'commentReply'
    }

    const comments = await this.commentRepository
      .createQueryBuilder("comment")
      .where({ commentableType: parentType })
      .innerJoinAndSelect(`comment.${parent}`, "parent", "parent.id =:parentId", { parentId: parentId})
      .getMany()

    if (!comments.length) {
      return null;
    }
    for(const comment of comments) { 
      await this.likeService.onRemoveParent('comment', comment.id);
      await this.onRemoveParent('comment', comment.id);
    }

    await this.commentRepository.remove(comments);
  }

}

