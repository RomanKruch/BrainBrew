import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Text } from './text.schema';
import { CreateTextDto } from './dto/createText.dto';

@Injectable()
export class TextService {
  constructor(@InjectModel(Text.name) private textModel: Model<Text>) {}

  async create(dto: CreateTextDto) {
    return this.textModel.create(dto);
  }

  async createMany(dtos: CreateTextDto[]) {
    return this.textModel.insertMany(dtos);
  }

  async findAll() {
    return this.textModel.find({ active: true });
  }

  async getOneNotSeen(seenTextIds: string[]): Promise<Text | null> {
    const excludedIds = seenTextIds.map(id => new Types.ObjectId(id));

    const result = await this.textModel.aggregate([
      {
        $match: {
          _id: { $nin: excludedIds },
          active: true,
        },
      },
      { $sample: { size: 1 } },
    ]);

    if (!result.length) return null;

    return result[0];
  }
}
