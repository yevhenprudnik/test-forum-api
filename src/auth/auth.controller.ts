import { Body, Controller, Get, Param, Post, Req, Res, UseGuards, Query, Headers } from '@nestjs/common';
import { RegisterDto } from '../dtos/register.dto';
import { LoginDto } from '../dtos/login.dto';
import { AuthService } from './auth.service';
import { TokenAuthGuard } from './guards/token.auth.guard';
import { SessionHandler } from './handlers/session.handler';
import { OauthHandler } from './handlers/oauth.handler';
import { SystemInfo } from 'src/decorators/system-info';
import { RefreshToken } from 'src/decorators/refresh-token';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sessionHandler: SessionHandler,
    private readonly oauthHandler: OauthHandler
) {}

  @Post('register')
  async register( @Body() registerDto: RegisterDto, @SystemInfo() systemInfo, @Res({ passthrough: true }) response){

    const { refreshToken, accessToken } = await this.authService.register(registerDto, systemInfo);

    response.cookie('refreshToken', refreshToken);
    response.cookie( 'accessToken', accessToken );
    
    return { refreshToken, accessToken };
  }

  @Post('logIn')
  async logIn(@Body() logInDto: LoginDto, @Res({ passthrough: true }) response, @SystemInfo() systemInfo){

    const { refreshToken, accessToken } = await this.authService.logIn(logInDto, systemInfo);

    response.cookie('refreshToken', refreshToken);
    response.cookie( 'accessToken', accessToken );

    return { refreshToken, accessToken };
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
  async refresh(@RefreshToken() refreshTokenFromClient, @Res({ passthrough: true }) response, @SystemInfo() systemInfo){

    const { refreshToken, accessToken } = await this.authService.refreshSession(refreshTokenFromClient, systemInfo);

    response.cookie('refreshToken', refreshToken);
    response.cookie( 'accessToken', accessToken );
    return { refreshToken, accessToken };
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
    response.cookie( 'accessToken', tokens.accessToken );
    
    return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
  }

  @Get('facebook')
  async facebookAuth(
    @Res({ passthrough: true }) response, 
    @SystemInfo() systemInfo, 
    @Headers('Authorization') AuthHeaders){

    const tokens = await this.oauthHandler.oauthHandler('facebook', AuthHeaders, systemInfo);
    response.cookie( 'refreshToken', tokens.refreshToken );
    response.cookie( 'accessToken', tokens.accessToken );
    
    return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
  }
}