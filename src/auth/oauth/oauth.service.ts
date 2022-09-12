import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { EmailHandler } from '../handlers/mail.handler';
import { SessionHandler } from '../handlers/session.handler';

@Injectable()
export class OauthService {
  constructor(
    @InjectRepository(User) 
    private readonly usersRepository: Repository<User>,
    private sessionHandler: SessionHandler,
    private mailerService: EmailHandler
  ) {}
  /**
   * @param  {any} profile
   * user profile from the provider
   */
  async oauthHandler(profile: any){
    const user = await this.usersRepository
    .createQueryBuilder('user')
    .where(`user.oauth ::jsonb @> \'{"id":"${profile.id}"}\'`)
    .getOne();
  if(user){
    return user;
  } else {
      const username = profile.displayName.toLocaleLowerCase().replace(/\s/g, '');
      const candidateByUsername = await this.usersRepository.findOneBy({ username });
      if (candidateByUsername){
        throw new BadRequestException(`Looks like username ${username} is already taken, please try common method of registration and come up with different username`);
      }

      const candidateByEmail = await this.usersRepository.findOneBy({ email : profile.emails[0].value });
      if (candidateByEmail){
        throw new BadRequestException(`Looks like username with email ${profile.emails[0].value} have already been registered via another authentication method. Please use your initial type of authentication`);
      }

      const emailConfirmationLink = randomUUID();
  
      const newUser = this.usersRepository.create({ 
        username, 
        email : profile.emails[0].value,
        emailConfirmationLink, 
        firstName: profile.displayName.split(' ')[0],
        lastName: profile.displayName.split(' ')[1],
        oauth: {
          provider : profile.provider,
          id : profile.id,
        }
      });
      
      const user = await this.usersRepository.save(newUser);
      
      await this.mailerService.sendActivationEmail(profile.emails[0].value, emailConfirmationLink);
      
      return user;
  }
  }

  async generateSession(request, parsedUA){
    if (!request.user) {
      throw new UnauthorizedException('Authorization failed')
    }
    const tokens = await this.sessionHandler.createSession(request.user, parsedUA);

    return tokens;
  }

}