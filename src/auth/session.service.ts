import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Session } from 'src/entities/session.entity';
import { JwtService } from '@nestjs/jwt'; 
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import hashFunction from '../helpers/string.hash.generator'
import { SystemInfo } from 'src/interfaces/systemInfo.interface';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session) 
    private readonly sessionRepository: Repository<Session>,
    private jwt: JwtService
  ) {}
  /**
   * @param  {User} user
   * user object
   * @param  {} systemInfo
   * information from user-agent header
   */
  async createSession(user: User, systemInfo: SystemInfo): Promise<Session>{
  
    const hashed = hashFunction(systemInfo.ua+user.username);

    const userSession = await this.sessionRepository
      .createQueryBuilder("session")
      .where({ id: hashed })
      .innerJoinAndSelect("session.user", "user", "user.id = :id", { id: user.id })
      .getOne();

    const accessToken = this.jwt.sign({userId : user.id}, { expiresIn : '30m' });
    const refreshToken = this.jwt.sign({userId : user.id}, { expiresIn : '30d' });

    if (userSession) {
      userSession.accessToken = accessToken;
      userSession.refreshToken = refreshToken;
      return this.sessionRepository.save(userSession);
    }

    const newSession = this.sessionRepository.create({
      id: hashed,
      accessToken, 
      refreshToken,
      user,
      device: {
        os: systemInfo.os.name,
        type: systemInfo.device.type || 'Browser',
        model: systemInfo.device.model
      }
    })

    return this.sessionRepository.save(newSession);
  }
  /**
   * @param  {string} token
   * access/refresh token
   */
  async validateToken(token: string): Promise<User> {
    try {
      const session = await this.sessionRepository
      .createQueryBuilder("session")
      .innerJoinAndSelect("session.user", "user")
      .where([
        { accessToken : token},
        { refreshToken : token}
      ])
      .getOne();

      if(!session){
        throw new UnauthorizedException('Token is not valid');
      }
      
      let dataFromToken : object = {};

      if (session.refreshToken === token) {
        dataFromToken = await this.jwt.verify(session.refreshToken);
      } else {
        dataFromToken = await this.jwt.verify(session.accessToken)
      }
      
      return session.user;

    } catch (error) {
      return null;
    }
  }
  /**
   * @param  {User} user
   * user object
   * @param  {} systemInfo
   * information from user-agent header
   * @param  {} sessionId
   * (optional) id of a session to remove
   */
  async removeSession(user: User, systemInfo: SystemInfo, sessionId?: number){

    if (!sessionId){
      sessionId = hashFunction(systemInfo.ua+user.username);
    }

    const userSession = await this.sessionRepository
      .createQueryBuilder("session")
      .innerJoinAndSelect("session.user", "user")
      .where("user.id = :id", { id: user.id})
      .where({ id: sessionId })
      .getOne();

    if (!userSession) {
      throw new UnauthorizedException('Authorization failed');
    }

    await this.sessionRepository.remove(userSession);

    return { loggedOut : true };
  }

}