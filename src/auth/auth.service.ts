import { BadRequestException, HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { RegisterDto } from '../dtos/register.dto';
import { LoginDto } from '../dtos/login.dto';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { SessionHandler } from './handlers/session.handler';
import { EmailHandler } from './handlers/mail.handler';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) 
    private readonly usersRepository: Repository<User>,
    private sessionHandler: SessionHandler,
    private mailerService: EmailHandler
  ) {}
  /**
   * @param  {RegisterDto} userDto
   * email, username, password, firstName, lastName
   * @returns object with user id and accessToken
   */
  async register(userDto: RegisterDto, parsedUA){
    const { username, email, password, firstName, lastName } = userDto;
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

    const tokens = await this.sessionHandler.createSession(newUser, parsedUA);

    return { userId: newUser.id, ...tokens };
  }
  
  /**
   * @param  {LoginDto} userDto
   * email, password
   * @returns object with user id and accessToken
   */
  async logIn(userDto: LoginDto, parsedUA){
    const { email, password } = userDto;
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

    const tokens = await this.sessionHandler.createSession(candidate, parsedUA);

    return { userId: candidate.id, ...tokens };
  }
  /**
   * @param  {string} refreshToken
   * Refresh token from cookies
   * @returns object with user id and accessToken
   */
  async refreshSession(refreshToken: string, parsedUA){
    const user = await this.sessionHandler.validateToken(refreshToken);
    if (!user){
      throw new UnauthorizedException("Refresh token is not valid");
    }

    const tokens = await this.sessionHandler.createSession(user, parsedUA);

    return { userId: user.id, ...tokens };
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

}