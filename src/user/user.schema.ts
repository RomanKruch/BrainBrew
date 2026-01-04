import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  telegramId: number;

  @Prop({ type: [String], default: [] })
  topics: string[];

  @Prop({ default: '08:00' })
  deliveryTime: string;

  @Prop({ default: true })
  enabled: boolean;

  @Prop({ type: [String], default: [] })
  likedTexts: string[];

  @Prop({ type: [String], default: [] })
  dislikedTexts: string[];

  @Prop({ type: [String], default: [] })
  seenTexts: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
