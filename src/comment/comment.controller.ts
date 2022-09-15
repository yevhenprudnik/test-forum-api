import { Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { TokenAuthGuard } from 'src/auth/guards/token.auth.guard';
import { CommentService } from './comment.service';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService){}

  @UseGuards(TokenAuthGuard)
  @Post(":targetType/:targetId")
  commentTarget(@Param('targetType') targetType, @Param('targetId') targetId, @Req() request, @Body('text') text: string){
    return this.commentService.addComment(targetType, targetId, request.user, text);
  }

  @UseGuards(TokenAuthGuard)
  @Delete(":targetType/:targetId")
  deleteComment(@Param('targetType') targetType, @Param('targetId') targetId, @Req() request){
    return this.commentService.removeComment(targetType, targetId, request.user);
  }

  @Get(":targetType/:targetId")
  getTargetComments(@Param('targetType') targetType, @Param('targetId') targetId, @Query('page') page: number){
    return this.commentService.getTargetComments(targetType, targetId, page || 0);
  }

}
