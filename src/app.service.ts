import { Injectable } from '@nestjs/common';
import { AppDataSource } from './index'
import { User } from './entities/user.entity';

@Injectable()
export class AppService {
  async getUsers(): Promise<object> {
    const users = await AppDataSource.manager.find(User);
    return users;
  }

  async createUser(data ) : Promise<object> {
    const user = new User();
    user.username = data.username;
    user.age = data.age;
    user.about = data.about;

    await AppDataSource.manager.save(user);

    return user;
  }
}
