import { BadRequestException, HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { SessionHandler } from './handlers/session.handler';
import { EmailHandler } from './handlers/mail.handler';
import { Session } from 'src/entities/session.entity';
import { usernameFunctions } from 'src/helpers/username.functions';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) 
    private readonly usersRepository: Repository<User>,
    private readonly sessionHandler: SessionHandler,
    private readonly mailerService: EmailHandler,
    private readonly httpService: HttpService,
  ) {}
  /**
   * @param  definition
   * email, username, password, firstName, lastName
   * @returns object with user id and accessToken
   */
  async register(definition: DeepPartial<User>, systemInfo): Promise<Session> {
    const { username, email, password, firstName, lastName } = definition;
    const candidate = await this.usersRepository.findOne({ where: [
      { email: email },
      { username: username }
    ]});
    if (candidate) {
      if (candidate.username === username && candidate.email !== email) {
        throw new HttpException(`Username ${username} is already taken, please try to come up with a different username`, HttpStatus.CONFLICT);
      } else {
        throw new HttpException(`User with email ${email} is already registered`, HttpStatus.CONFLICT);
      }
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const emailConfirmationLink = randomUUID();

    const newUser = this.usersRepository.create({ 
      username, 
      email, 
      password: hashPassword, 
      emailConfirmationLink, 
      firstName, 
      lastName 
    });
    
    await this.usersRepository.save(newUser);
    
    await this.mailerService.sendActivationEmail(email, emailConfirmationLink);

    return this.sessionHandler.createSession(newUser, systemInfo);
  }
  
  /**
   * @param  definition
   * email, password
   * @returns object with user id and accessToken
   */
  async logIn(definition: DeepPartial<User>, systemInfo): Promise<Session>{
    const { email, password } = definition;
    const candidate = await this.usersRepository.findOneBy({ email });
    if (!candidate) {
      throw new HttpException("User not found", HttpStatus.NOT_FOUND);
    }
    if (candidate.oauth.provider) {
      throw new HttpException(`You have been authorized via ${candidate.oauth.provider}`, HttpStatus.BAD_REQUEST);
    }
    const isPasswordEqual = await bcrypt.compare(password, candidate.password);
    if (!isPasswordEqual) {
      throw new HttpException("Wrong credentials", HttpStatus.BAD_REQUEST);
    }

    return this.sessionHandler.createSession(candidate, systemInfo);
  }
  /**
   * @param  {string} refreshToken
   * Refresh token from cookies
   * @returns object with user id and accessToken
   */
  async refreshSession(refreshToken: string, systemInfo): Promise<Session>{
    const user = await this.sessionHandler.validateToken(refreshToken);
    if (!user){
      throw new UnauthorizedException("Refresh token is not valid");
    }

    return this.sessionHandler.createSession(user, systemInfo);;
  }
  /**
   * @param  {string} accessToken
   * Access token from auth headers
   * @returns object with user info
   */
  async authorize(accessToken: string): Promise<User> {
    const user = await this.sessionHandler.validateToken(accessToken);
    if (!user){
      throw new UnauthorizedException("Access token is not valid");
    }

    return user;
  }
  /**
   * @param  {string} link
   * link that was randomly generated during registration
   * @returns confirmed email status
   */
  async activateEmail(link: string){
    const user = await this.usersRepository.findOneBy({ emailConfirmationLink: link });

    if (!user) {
      throw new BadRequestException('Activation link is not valid');
    }
    user.confirmedEmail = true;
    await this.usersRepository.save(user);

    return { confirmed: true }
  }

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
      return this.oauthUserHandler(userinfo.data, provider, systemInfo);
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Invalid access token');
    }
  }
  
  /**
   * @param  {any} profile
   * user profile from the provider
   */
  async oauthUserHandler(profile: any, provider: string, systemInfo): Promise<Session>{
    const userFromDb = await this.usersRepository
    .createQueryBuilder('user')
    .where(`user.oauth ::jsonb @> \'{"id":"${profile.id}"}\'`)
    .getOne();
    if(userFromDb){
      return this.sessionHandler.createSession(userFromDb, systemInfo)
    } 
    const candidateByEmail = await this.usersRepository.findOneBy({ email : profile.email });
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

  async generateUsername(profileName: string){
    for(const fn of usernameFunctions){
      const username = fn(profileName);
      const candidateByUsername = await this.usersRepository.findOneBy({ username });
      if (!candidateByUsername){
        return username;
      }
    }
    return null;
  }

}