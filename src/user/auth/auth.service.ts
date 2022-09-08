import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) 
    private readonly usersRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }
  
  async register(userDto: RegisterDto){
    const user = await this.usersRepository.findOne({ where: [
      { email: userDto.email },
      { username: userDto.username }
    ]});
    if (user){
      throw new Error("User is already registered");
    }
    const newUser = this.usersRepository.create({
      username: userDto.username,
      email: userDto.email,
      password: userDto.password
    });
    return this.usersRepository.save(newUser);
  }

  async logIn(userDto: LoginDto){
    const user = await this.usersRepository.findOne({ where: {
      email: userDto.email,
      password: userDto.password
    }});
    if (!user) {
      throw new Error("Unauthorized");
    }
    return user;
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });
    return user;
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }
}