import { Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { TokenAuthGuard } from 'src/auth/guards/token.auth.guard';
import { PostDto } from 'src/dtos/post.dto';
import { PostService } from './post.service';

@Controller('post')
export class PostController {
  constructor(
    private readonly postService: PostService
  ){}

  @UseGuards(TokenAuthGuard)
  @Post()
  createPost(@Body() input: PostDto, @Req() request){
    return this.postService.createPost(input, request.user);
  }

  @Get('id/:id')
  getPostById(@Param('id') id: number){
    return this.postService.getPostById(id);
  }

  @Get()
  getAllPost(@Query('page') page: number){
    return this.postService.getAllPost(page || 0);
  }

  @Get('user/:username')
  getPostsByUser(@Param('username') username: string, @Query('page') page: number){
    return this.postService.getPostsByUser(username, page || 0);
  }

  @UseGuards(TokenAuthGuard)
  @Post('edit/:id')
  editPost(@Param('id') id: number, @Req() request, @Body() input: PostDto){
    return this.postService.editPost(id, request.user.id, input);
  }

  @UseGuards(TokenAuthGuard)
  @Delete('delete/:id')
  deletePost(@Param('id') id: number, @Req() request){
    return this.postService.deletePost(id, request.user.id);
  }

}
