import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { TokenAuthGuard } from 'src/user/guards/token.auth.guard';
import { PostDto } from 'src/dtos/post.dto';
import { PostService } from './post.service';
import { SearchQuery } from 'src/dtos/serachQuery.dto';

@Controller('posts')
export class PostController {
  constructor( private readonly postService: PostService ){}

  @UseGuards(TokenAuthGuard)
  @Post()
  createPost(@Body() input: PostDto, @Req() request){
    return this.postService.createPost(input, request.user);
  }

  @Get(':id')
  getPostById(@Param('id') id: number){
    return this.postService.getPostById(id);
  }

  @Get('search/separated')
  async getPostsByTag( @Query() searchQuery : SearchQuery ){

    const { limit, cursor, ...restQuery } = searchQuery;

    if (searchQuery.tag){
      return this.postService.getPostsByTag(restQuery, cursor || new Date(), limit || 20);
    }
    return this.postService.getPosts(restQuery, cursor || new Date(), limit || 20);
  }

  @Get('search/combined')
  async getPosts( @Query() searchQuery : SearchQuery ){
    
    const { limit, cursor, ...restQuery } = searchQuery;

    return this.postService.combinedSearch(restQuery, cursor || new Date(), limit || 20);
  }

  @UseGuards(TokenAuthGuard)
  @Patch(':id')
  editPost(
    @Param('id') id: number, 
    @Req() request, 
    @Body() input: PostDto){
    return this.postService.editPost(id, request.user.id, input);
  }

  @UseGuards(TokenAuthGuard)
  @Delete(':id')
  deletePost(@Param('id') id: number, @Req() request){
    return this.postService.deletePost(id, request.user.id);
  }

}
