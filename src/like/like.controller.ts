import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { TokenAuthGuard } from 'src/auth/guards/token.auth.guard';
import { LikeService } from './like.service';

@Controller('like')
export class LikeController {
  constructor(private readonly likeService: LikeService){}

  @UseGuards(TokenAuthGuard)
  @Get(":targetType/:targetId")
  likeTarget(@Param('targetType') targetType, @Param('targetId') targetId, @Req() request){
    return this.likeService.handleLike(targetType, targetId, request.user);
  }

  @Get("likes/:targetType/:targetId")
  getTargetLikes(@Param('targetType') targetType, @Param('targetId') targetId, @Query('page') page: number){
    return this.likeService.getTargetLikes(targetType, targetId, page || 0);
  }
}
