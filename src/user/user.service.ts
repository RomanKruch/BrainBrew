import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from './user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findAllUsers() {
    return this.userModel.find({ enabled: true });
  }

  async findOrCreate(telegramId: number) {
    let user = await this.userModel.findOne({ telegramId });
    if (!user) user = await this.userModel.create({ telegramId });
    return user;
  }

  // 1️⃣ позначити як прочитано
  async markAsRead(userId: Types.ObjectId, textId: Types.ObjectId) {
    await this.userModel.updateOne({ _id: userId }, { $addToSet: { seenTexts: textId } });
  }

  // 2️⃣ лайкнути текст
  async likeText(userId: Types.ObjectId, textId: Types.ObjectId) {
    await this.userModel.updateOne(
      { _id: userId },
      {
        $addToSet: { likedTexts: textId },
        $pull: { dislikedTexts: textId }, // прибираємо з дизлайку
      },
    );
  }

  // 3️⃣ дизлайкнути текст
  async dislikeText(userId: Types.ObjectId, textId: Types.ObjectId) {
    await this.userModel.updateOne(
      { _id: userId },
      {
        $addToSet: { dislikedTexts: textId },
        $pull: { likedTexts: textId }, // прибираємо з лайку
      },
    );
  }

  async updateLocation(telegramId: number, lat: number, lon: number) {
    return this.userModel.findOneAndUpdate({ telegramId }, { lat, lon }, { new: true });
  }
}
