import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Session } from 'src/entities/session.entity';
import { usernameFunctions } from 'src/helpers/username.functions';
import { AuthService } from '../auth.service';

@Injectable()
export class OauthHandler {
  constructor(
    private readonly httpService: HttpService,
    private readonly authService: AuthService,
  ) {}
    /**
     * @param  {string} provider
     * google/facebook
     * @param  {string} token
     * access oauth token from the client
     * @param  {} systemInfo
     * 
     */
    async oauthHandler(provider: string, token: string, systemInfo): Promise<Session>{
      try {
        let dataFromProviderURL = '';
        if (provider === 'facebook'){
          dataFromProviderURL = process.env.OAUTH_URL_FACEBOOK
        } else if (provider === 'google') {
          dataFromProviderURL = process.env.OAUTH_URL_GOOGLE
        } else {
          throw new BadRequestException('Provider unavailable')
        }
        const userinfo = await this.httpService.axiosRef.get(dataFromProviderURL, {
          headers : {
            authorization: 'Bearer ' + token.split(" ")[1]
        }})
        return this.authUser(userinfo.data, provider, systemInfo);
      } catch (error) {
        console.log(error);
        throw new BadRequestException('Invalid access token');
      }
    }

  /**
   * @param  {any} profile
   * user profile from the provider
   */
  async authUser(profile: any, provider: string, systemInfo): Promise<Session>{
    const userFromDb = await this.authService.usersRepository
    .createQueryBuilder('user')
    .where(`user.oauth ::jsonb @> \'{"id":"${profile.id}"}\'`)
    .getOne();
    if(userFromDb){
      return this.authService.sessionHandler.createSession(userFromDb, systemInfo)
    } 
    const candidateByEmail = await this.authService.usersRepository.findOneBy({ email : profile.email });
    if (candidateByEmail){
      throw new BadRequestException(`Looks like username with email ${profile.email} have already been registered via another authentication method. Please use your initial type of authentication`);
    }
    const username = await this.generateUsername(profile.name);
    if (!username){
      throw new BadRequestException(`Please try common method of registration and come up with unique username`);
    }
    
    if (provider === 'facebook') {
      profile.given_name = profile.first_name;
      profile.family_name = profile.last_name;
      profile.picture = profile.picture.data.url;
    }

    const newUser = this.authService.usersRepository.create({ 
      username, 
      email : profile.email,
      confirmedEmail: true,
      firstName: profile.given_name,
      lastName: profile.family_name,
      profilePicture: profile.picture,
      oauth: {
        provider,
        id : profile.id,
      }
    });
    
  const user = await this.authService.usersRepository.save(newUser);
        
  return this.authService.sessionHandler.createSession(user, systemInfo)
  }

  async generateUsername(profileName: string){
    for(const fn of usernameFunctions){
      const username = fn(profileName);
      const candidateByUsername = await this.authService.usersRepository.findOneBy({ username });
      if (!candidateByUsername){
        return username;
      }
    }
    
    return null;
  }

}
