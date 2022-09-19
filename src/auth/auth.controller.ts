import { Body, Controller, Get, Param, Post, Req, Res, UseGuards, Query, Headers } from '@nestjs/common';
import { RegisterDto } from '../dtos/register.dto';
import { LoginDto } from '../dtos/login.dto';
import { AuthService } from './auth.service';
import { TokenAuthGuard } from './guards/token.auth.guard';
import { SessionHandler } from './handlers/session.handler';
import { OauthHandler } from './handlers/oauth.handelr';
import { SystemInfo } from 'src/decorators/user-agent.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sessionHandler: SessionHandler,
    private readonly oauthHandler: OauthHandler
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

    return this.sessionHandler.removeSession(request.user, systemInfo, id);
  }

  @Get('activateEmail/:link')
  activateEmail(@Param('link') link: string){
    return this.authService.activateEmail(link);
  }

  @Get('auth')
  @UseGuards(TokenAuthGuard)
  auth(@Req() request): object{
    const { password, emailConfirmationLink, confirmedEmail, oauth, ...dataForClient } = request.user;
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
    return this.sessionHandler.getAllSession(request.user);
  }

  @Get('google')
  async googleAuth(
    @Res({ passthrough: true }) response, 
    @SystemInfo() systemInfo, 
    @Headers('Authorization') AuthHeaders){

    const tokens = await this.oauthHandler.oauthHandler('google', AuthHeaders, systemInfo);
    response.cookie( 'refreshToken', tokens.refreshToken );
    
    return { accessToken: tokens.accessToken };
  }

  @Get('facebook')
  async facebookAuth(
    @Res({ passthrough: true }) response, 
    @SystemInfo() systemInfo, 
    @Headers('Authorization') AuthHeaders){

    const tokens = await this.oauthHandler.oauthHandler('facebook', AuthHeaders, systemInfo);
    response.cookie( 'refreshToken', tokens.refreshToken );
    
    return { accessToken: tokens.accessToken };
  }
}