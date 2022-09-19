import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Session } from 'src/entities/session.entity';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { EmailHandler } from './mail.handler';
import { SessionHandler } from './session.handler';
@Injectable()
export class OauthHandler {
  constructor(
    @InjectRepository(User) 
    private readonly usersRepository: Repository<User>,
    private readonly sessionHandler: SessionHandler,
    private readonly httpService: HttpService
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
    const user = await this.usersRepository
    .createQueryBuilder('user')
    .where(`user.oauth ::jsonb @> \'{"id":"${profile.id}"}\'`)
    .getOne();
  if(user){
    return this.sessionHandler.createSession(user, systemInfo)
  } else {
      const username = profile.name.toLocaleLowerCase().replace(/\s/g, '');
      const candidateByUsername = await this.usersRepository.findOneBy({ username });
      if (candidateByUsername){
        throw new BadRequestException(`Looks like username ${username} is already taken, please try common method of registration and come up with different username`);
      }
      const candidateByEmail = await this.usersRepository.findOneBy({ email : profile.email });
      if (candidateByEmail){
        throw new BadRequestException(`Looks like username with email ${profile.email} have already been registered via another authentication method. Please use your initial type of authentication`);
      }
      
      if (provider === 'facebook') {
        profile.given_name = profile.first_name;
        profile.family_name = profile.last_name;
        profile.picture = profile.picture.data.url;
      }
  
      const newUser = this.usersRepository.create({ 
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
      
      const user = await this.usersRepository.save(newUser);
            
      return this.sessionHandler.createSession(user, systemInfo)
    }
  }

}