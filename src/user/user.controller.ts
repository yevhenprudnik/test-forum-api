import { Body, Controller, Get, Param, Post, Req, Res, UseGuards, Query, Headers } from '@nestjs/common';
import { RegisterDto } from '../dtos/register.dto';
import { LoginDto } from '../dtos/login.dto';
import { UserService } from './user.service';
import { TokenAuthGuard } from './guards/token.auth.guard';
import { SessionService } from './session.service';
import { SystemInfo } from 'src/decorators/system-info';
import { RefreshToken } from 'src/decorators/refresh-token';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly sessionService: SessionService,
) {}

  @Post('register')
  async register( @Body() registerDto: RegisterDto, @SystemInfo() systemInfo, @Res({ passthrough: true }) response){

    const { refreshToken, accessToken } = await this.userService.register(registerDto, systemInfo);

    response.cookie('refreshToken', refreshToken);
    response.cookie( 'accessToken', accessToken );
    
    return { refreshToken, accessToken };
  }

  @Post('logIn')
  async logIn(@Body() logInDto: LoginDto, @Res({ passthrough: true }) response, @SystemInfo() systemInfo){

    const { refreshToken, accessToken } = await this.userService.logIn(logInDto, systemInfo);

    response.cookie('refreshToken', refreshToken);
    response.cookie( 'accessToken', accessToken );

    return { refreshToken, accessToken };
  }

  @Get('logOut')
  @UseGuards(TokenAuthGuard)
  logOut(@Req() request, @SystemInfo() systemInfo, @Query('id') id, @Res({ passthrough: true }) response){
    
    response.clearCookie('refreshToken');
    response.clearCookie('accessToken');

    return this.sessionService.removeSession(request.user, systemInfo, id);
  }

  @Get('activateEmail/:link')
  activateEmail(@Param('link') link: string){
    return this.userService.activateEmail(link);
  }

  @Get('auth')
  @UseGuards(TokenAuthGuard)
  auth(@Req() request): object{
    
    const { password, emailConfirmationLink, confirmedEmail, oauth, ...dataForClient } = request.user;

    return dataForClient;
  }

  @Get('refresh')
  async refresh(@RefreshToken() refreshTokenFromClient, @Res({ passthrough: true }) response, @SystemInfo() systemInfo){

    const { refreshToken, accessToken } = await this.userService.refreshSession(refreshTokenFromClient, systemInfo);

    response.cookie('refreshToken', refreshToken);
    response.cookie( 'accessToken', accessToken );
    
    return { refreshToken, accessToken };
  }

  @Get('sessions')
  @UseGuards(TokenAuthGuard)
  getSessions(@Req() request){
    return this.userService.getAllSessions(request.user);
  }

  @Post('edit-username')
  @UseGuards(TokenAuthGuard)
  editUsername(@Req() request, @Body() body){
    
    const { username } = body;

    return this.userService.editUsername(username, request.user)
  }

  @Get('google')
  async googleAuth(
    @Res({ passthrough: true }) response, 
    @SystemInfo() systemInfo, 
    @Headers('Authorization') AuthHeaders){

    const tokens = await this.userService.oauthHandler('google', AuthHeaders, systemInfo);
    
    response.cookie( 'refreshToken', tokens.refreshToken );
    response.cookie( 'accessToken', tokens.accessToken );
    
    return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
  }

  @Get('facebook')
  async facebookAuth(
    @Res({ passthrough: true }) response, 
    @SystemInfo() systemInfo, 
    @Headers('Authorization') AuthHeaders){

    const tokens = await this.userService.oauthHandler('facebook', AuthHeaders, systemInfo);
    
    response.cookie( 'refreshToken', tokens.refreshToken );
    response.cookie( 'accessToken', tokens.accessToken );
    
    return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
  }

  @UseGuards(TokenAuthGuard)
  @Get('users')
  getUsers(){
    return this.userService.findAll()
  }

  @UseGuards(TokenAuthGuard)
  @Get('/:username')
  getUser(@Param('username') username: string){
    return this.userService.getUser(username);
  }

  @UseGuards(TokenAuthGuard)
  @Get(':username/posts')
  getUserPost(@Param('username') username: string, @Query('limit') limit: number, @Query('cursor') cursor: Date){
    return this.userService.getUserPosts(username, cursor || new Date(), limit || 20);
  }

}