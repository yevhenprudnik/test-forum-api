import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

const selectOptions = { //test comment 
  username: true,
  email: true,
  firstName: true,
  lastName: true,
  profilePicture: true,
  createdAt: true
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) 
    private readonly usersRepository: Repository<User>){}
  
  findAll(): Promise<User[]>{
    return this.usersRepository.find({
      select : selectOptions
    })
  }
  /**
   * @param  {string} username
   * username of user to find
   */
  getUser(username: string): Promise<User>{
    return this.usersRepository.findOne({ 
      where: { username: username }
    });
  }
}
