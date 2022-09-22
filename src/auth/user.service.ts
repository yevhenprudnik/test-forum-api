import { BadRequestException, HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { SessionService } from './session.service';
import { EmailHandler } from './handlers/mail.handler';
import { Session } from 'src/entities/session.entity';
import { HttpService } from '@nestjs/axios';
import { GoogleUser, FacebookUser } from 'src/interfaces/oauth.profile.interfaces';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) 
    private readonly usersRepository: Repository<User>,
    private readonly sessionService: SessionService,
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

    return this.sessionService.createSession(newUser, systemInfo);
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

    return this.sessionService.createSession(candidate, systemInfo);
  }
  /**
   * @param  {string} refreshToken
   * Refresh token from cookies
   * @returns object with user id and accessToken
   */
  async refreshSession(refreshToken: string, systemInfo): Promise<Session>{
    const user = await this.sessionService.validateToken(refreshToken);
    
    if (!user){
      throw new UnauthorizedException("Refresh token is not valid");
    }

    return this.sessionService.createSession(user, systemInfo);;
  }
  /**
   * @param  {string} accessToken
   * Access token from auth headers
   * @returns object with user info
   */
  async authorize(accessToken: string): Promise<User> {
    const user = await this.sessionService.validateToken(accessToken);
    
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

  async editUsername(username: string, user: DeepPartial<User>): Promise<User> {
    if (!username) {
      throw new BadRequestException("Wrong credentials")
    }

    const candidate = await this.usersRepository.countBy({ username });
    
    if(candidate){
      throw new BadRequestException(`Username ${username} is already taken`);
    }
    
    user.username = username;
    
    return this.usersRepository.save(user);
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
  async oauthUserHandler(profile: FacebookUser & GoogleUser, provider: string, systemInfo): Promise<Session>{
    const user = await this.usersRepository
    .createQueryBuilder('user')
    .where(`user.oauth ::jsonb @> \'{"id":"${profile.id}"}\'`)
    .getOne();
    
    if(user){
      return this.sessionService.createSession(user, systemInfo)
    } 
    
    const candidateByEmail = await this.usersRepository.countBy({ email : profile.email });
    
    if (candidateByEmail) {
      throw new BadRequestException(`Looks like user with email ${profile.email} have already been registered via another authentication method. Please use your initial type of authentication`);
    }

    let newUser: User;

    if (provider === 'facebook'){
      newUser = await this.createUserViaFacebook(profile);
    } else {
      newUser = await this.createUserViaGoogle(profile);
    }
    
    const savedUser = await this.usersRepository.save(newUser);
          
    return this.sessionService.createSession(savedUser, systemInfo)
  }

  async createUserViaGoogle(profile: GoogleUser) : Promise<User>{
    return this.usersRepository.create({
      email : profile.email,
      confirmedEmail: true,
      firstName: profile.given_name,
      lastName: profile.family_name,
      profilePicture: profile.picture,
      oauth: {
        provider: "google",
        id : profile.id,
      }
    });
  }

  async getAllSession(user: User){
    const userSessions = await this.usersRepository
      .createQueryBuilder("user")
      .where({ id: user.id })
      .innerJoinAndSelect("user.sessions", "sessions")
      .select(["user.username","sessions.device"])
      .getMany()

    if (!userSessions.length) {
        throw new UnauthorizedException('Authorization failed');
    }
    return userSessions;
  }

  async createUserViaFacebook(profile: FacebookUser) : Promise<User>{
    return this.usersRepository.create({
      email : profile.email,
      confirmedEmail: true,
      firstName: profile.first_name,
      lastName: profile.last_name,
      profilePicture: profile.picture.data.url,
      oauth: {
        provider: "facebook",
        id : profile.id,
      }
    });
  }

  async findAll(): Promise<User[]>{
    return this.usersRepository.find({
      select : ['username', 'email', 'firstName', 'lastName', 'profilePicture']
    })
  }
  /**
   * @param  {string} username
   * username of user to find
   */
  async getUser(username: string): Promise<User>{
    return this.usersRepository.findOne({ 
      where: { username: username },
      select : ['username', 'email', 'firstName', 'lastName', 'profilePicture']
    });
  }

}