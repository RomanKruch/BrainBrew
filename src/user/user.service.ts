import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findOrCreate(telegramId: number) {
    let user = await this.userModel.findOne({ telegramId });
    if (!user) user = await this.userModel.create({ telegramId });
    return user;
  }

  async updateTopics(telegramId: number, topics: string[]) {
    return this.userModel.updateOne({ telegramId }, { topics });
  }
}
