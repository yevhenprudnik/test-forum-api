import { Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { TokenAuthGuard } from 'src/auth/guards/token.auth.guard';
import { CommentDto } from 'src/dtos/comment.dto';
import { CommentService } from './comment.service';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService){}

  @UseGuards(TokenAuthGuard)
  @Post(":targetType/:targetId")
  commentTarget(@Param('targetType') targetType, @Param('targetId') targetId, @Req() request, @Body() comment: CommentDto){
    return this.commentService.addComment(targetType, targetId, request.user, comment);
  }

  @UseGuards(TokenAuthGuard)
  @Delete("delete/:commentId")
  deleteComment( @Param('commentId') commentId, @Req() request){
    return this.commentService.removeComment(commentId, request.user);
  }

  @Get(":targetType/:targetId")
  getTargetComments(@Param('targetType') targetType, @Param('targetId') targetId, @Query('page') page: number){
    return this.commentService.getTargetComments(targetType, targetId, page || 0);
  }

}
