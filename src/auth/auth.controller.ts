import { Body, Controller, Get, Param, Post, Req, Res, UseGuards, Query } from '@nestjs/common';
import { RegisterDto } from '../dtos/register.dto';
import { LoginDto } from '../dtos/login.dto';
import { AuthService } from './auth.service';
import { TokenAuthGuard } from './guards/token.auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { SessionHandler } from './handlers/session.handler';
import { OauthService } from './oauth/oauth.service';
import { SystemInfo } from 'src/decorators/user-agent.decorator';


@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sessionHandler: SessionHandler,
    private readonly oauthService: OauthService
) {}

  @Post('register')
  async register( @Body() userDto: RegisterDto, @SystemInfo() systemInfo, @Res({ passthrough: true }) response){

    const { refreshToken, ...rest } = await this.authService.register(userDto, systemInfo);

    response.cookie('refreshToken', refreshToken);
    
    return rest;
  }

  @Post('logIn')
  async logIn(@Body() userDto: LoginDto, @Res({ passthrough: true }) response, @SystemInfo() systemInfo){

    const { refreshToken, ...rest } = await this.authService.logIn(userDto, systemInfo);

    response.cookie('refreshToken', refreshToken);

    return rest;
  }

  @Get('logOut')
  @UseGuards(TokenAuthGuard)
  logOut(@Req() request, @SystemInfo() systemInfo, @Query('id') id){
    return this.sessionHandler.removeSession(request.user.id, systemInfo, id);
  }

  @Get('activateEmail/:link')
  activateEmail(@Param('link') link: string){
    return this.authService.activateEmail(link);
  }

  @Get('auth')
  @UseGuards(TokenAuthGuard)
  auth(@Req() request): object{
    const { 
      password,
      emailConfirmationLink,
      confirmedEmail,
      oauth,
      ...dataForClient 
    } = request.user;
    
    return dataForClient;
  }

  @Get('refresh')
  async refresh(@Req() request, @Res({ passthrough: true }) response, @SystemInfo() systemInfo){

    const { refreshToken, ...rest } = await this.authService.refreshSession(request.cookies.refreshToken, systemInfo);

    response.cookie('refreshToken', refreshToken);
    return rest;
  }

  @Get('sessions')
  @UseGuards(TokenAuthGuard)
  getSessions(@Req() request){
    return this.sessionHandler.getAllSession(request.user.id);
  }

  @Get('oauth/google')
  @UseGuards(AuthGuard('google'))
  googleAuth(){}

  @Get('oauth/callback/google')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() request, @Res({ passthrough: true }) response, @SystemInfo() systemInfo){

    const tokens = await this.oauthService.generateSession(request, systemInfo);
    response.cookie( 'refreshToken', tokens.refreshToken );
    
    return {accessToken: tokens.accessToken, userId: request.user.id };
  }

  @Get('oauth/facebook')
  @UseGuards(AuthGuard('facebook'))
  facebookAuth(){}

  @Get('oauth/callback/facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuthRedirect(@Req() request, @Res({ passthrough: true }) response, @SystemInfo() systemInfo){

    const tokens = await this.oauthService.generateSession(request, systemInfo);
    response.cookie( 'refreshToken', tokens.refreshToken );
    
    return {accessToken: tokens.accessToken, userId: request.user.id };
  }
}