import { Body, Controller, Get, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { RegisterDto } from '../dtos/register.dto';
import { LoginDto } from '../dtos/login.dto';
import { AuthService } from './auth.service';
import { TokenAuthGuard } from './guards/token.auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { SessionHandler } from './handlers/session.handler';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sessionHandler: SessionHandler
) {}

  @Post('register')
  async register(@Body() userDto: RegisterDto, @Res({ passthrough: true }) response){

    const { refreshToken, ...rest } = await this.authService.register(userDto);

    response.cookie( 'refreshToken', refreshToken );
    
    return rest;
  }

  @Post('logIn')
  async logIn(@Body() userDto: LoginDto, @Res({ passthrough: true }) response){
    const { refreshToken, ...rest } = await this.authService.logIn(userDto);

    response.cookie( 'refreshToken', refreshToken );

    return rest;
  }

  @Get('logOut')
  @UseGuards(TokenAuthGuard)
  logOut(@Req() request): object{
    return this.sessionHandler.removeSession(request.user.id);
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
  async refresh(@Req() request, @Res({ passthrough: true }) response){
    const tokenFromUser = request.cookies.refreshToken;

    const { refreshToken, ...rest } = await this.authService.refreshSession(tokenFromUser);

    response.cookie( 'refreshToken', refreshToken );
    return rest;
  }

  @Get('oauth/google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req){}

  @Get('oauth/callback/google')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() request, @Res({ passthrough: true }) response): Promise<object>{

    const { refreshToken, ...rest } = await this.sessionHandler.getSession(request.user.id);

    response.cookie( 'refreshToken', refreshToken );
    
    return rest;
  }

  @Get('oauth/facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuth(@Req() req){}

  @Get('oauth/callback/facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuthRedirect(@Req() request, @Res({ passthrough: true }) response): Promise<object>{

    const { refreshToken, ...rest } = await this.sessionHandler.getSession(request.user.id);

    response.cookie( 'refreshToken', refreshToken );
    
    return rest;
  }
}