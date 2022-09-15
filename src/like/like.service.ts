import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from 'src/entities/comment.entity';
import { Like } from 'src/entities/like.entity';
import { Post } from 'src/entities/post.entity';
import { User } from 'src/entities/user.entity';
import { PostService } from 'src/post/post.service';
import { Repository } from 'typeorm';

@Injectable()
export class LikeService { 
  constructor(
    private readonly postService: PostService,
    @InjectRepository(Like) 
    private readonly likeRepository: Repository<Like>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ){}

  async handleLike(targetType: string, targetId: number, user: User){
    if(targetType !== 'comment' && targetType !== 'post'){
      throw new BadRequestException('Only post and comments can be liked');
    }
    if (targetType === 'comment') {
      const comment = await this.commentRepository.findOneBy({ id: targetId});
      if(!comment) {
        throw new NotFoundException("Comment not found");
      }

      const likedComment = await this.likeRepository
      .createQueryBuilder("like")
      .where({ likeableType: "comment" })
      .innerJoinAndSelect("like.comment", "comment", "comment.id =:commentId", { commentId: targetId})
      .innerJoinAndSelect("like.author", "author", "author.id =:authorId", { authorId: user.id})
      .getOne()

      if (likedComment){
        await this.likeRepository.remove(likedComment);
        return { message: 'Like removed successfully', comment: likedComment };
      }

      const newLikeComment = this.likeRepository.create({
        likeableType: 'comment',
        comment: comment,
        author: user
      });

      await this.likeRepository.save(newLikeComment);

      return { message: 'Like added successfully', comment: newLikeComment };
    } else {
      const post = await this.postRepository.findOneBy({ id: targetId });

      if(!post) {
        throw new NotFoundException("Post not found");
      }

      const likedPost = await this.likeRepository
      .createQueryBuilder("like")
      .where({ likeableType: "post" })
      .innerJoinAndSelect("like.post", "post", "post.id =:postId", { postId: targetId})
      .innerJoinAndSelect("like.author", "author", "author.id =:authorId", { authorId: user.id })
      .getOne()

      if (likedPost){
        await this.postService.handlePostLike(post, 'removeLike')
        await this.likeRepository.remove(likedPost);
        return { message: 'Like removed successfully', post: post };
      }

      const newLikePost = this.likeRepository.create({
        likeableType: 'post',
        post: post,
        author: user
      });

      await this.likeRepository.save(newLikePost);

      return { message: 'Like added successfully', post: newLikePost };
    }
  }

  async getTargetLikes(targetType: string, targetId: number, page: number){
    if(targetType !== 'comment' && targetType !== 'post'){
      throw new BadRequestException('Only post and comments have comments');
    }

    const likesPerPage = 100;

    const likes = await this.likeRepository
      .createQueryBuilder("like")
      .where({ likeableType: targetType })
      .innerJoinAndSelect(`like.${targetType}`, "parent", "parent.id =:parentId", { parentId: targetId})
      .innerJoinAndSelect("like.author", "author")
      .select(["like", "parent", "author.username"])
      .skip(likesPerPage*page)
      .take(likesPerPage)
      .getMany()

    return likes
  }

  async onRemoveParent(parentType: string, parentId: number){
    const likes = await this.likeRepository
      .createQueryBuilder("like")
      .where({ likeableType: parentType })
      .innerJoinAndSelect(`like.${parentType}`, "parent", "parent.id =:parentId", { parentId: parentId})
      .getMany()

    if (!likes.length) {
      return null;
    }
    await this.likeRepository.remove(likes);
  }

}

