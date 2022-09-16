import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Session } from 'src/entities/session.entity';
import { JwtService } from '@nestjs/jwt'; 
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import hashFunction from '../../helpers/string.hash.generator'

@Injectable()
export class SessionHandler {
  constructor(
    @InjectRepository(Session) 
    private readonly sessionRepository: Repository<Session>,
    private jwt: JwtService
  ) {}

  async createSession(user: User, systemInfo){
  
    const hashed = hashFunction(systemInfo.ua+user.username);
    const userSession = await this.sessionRepository
      .createQueryBuilder("session")
      .where({ id: hashed })
      .innerJoinAndSelect("session.user", "user")
      .where("user.id = :id", { id: user.id })
      .getOne();

    const accessToken = this.jwt.sign({userId : user.id}, { expiresIn : '30m' });
    const refreshToken = this.jwt.sign({userId : user.id}, { expiresIn : '30d' });
    if (userSession) {
      userSession.accessToken = accessToken;
      userSession.refreshToken = refreshToken;
      await this.sessionRepository.save(userSession);
      return { 
        accessToken : userSession.accessToken,
        refreshToken : userSession.refreshToken 
      };
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
    await this.sessionRepository.save(newSession);

    return { 
      accessToken : newSession.accessToken,
      refreshToken : newSession.refreshToken 
    };
  }

  async validateToken(token: string) {
    try {
      const session = await this.sessionRepository
      .createQueryBuilder("session")
      .innerJoinAndSelect("session.user", "user")
      .where([
        { accessToken : token},
        { refreshToken : token}
      ]).getOne();

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

  async getAllSession(userId: number){
    const userSessions = await this.sessionRepository
        .createQueryBuilder("session")
        .innerJoinAndSelect("session.user", "user")
        .where("user.id = :id", { id: userId })
        .select("session.device")
        .getMany();

      if (!userSessions.length) {
        throw new UnauthorizedException('Authorization failed');
      }
      return userSessions;
  }

  async removeSession(userId: number, systemInfo, sessionId?){

    if (!sessionId){
      sessionId = hashFunction(systemInfo.ua);
    }
    const userSession = await this.sessionRepository
      .createQueryBuilder("session")
      .innerJoinAndSelect("session.user", "user")
      .where("user.id = :id", { id: userId})
      .where(`session.device ::jsonb @> \'{"sessionId":${sessionId}}\'`)
      .getOne();

    if (!userSession) {
      throw new UnauthorizedException('Authorization failed');
    }

    await this.sessionRepository.remove(userSession);

    return { loggedOut : true };
  }

}