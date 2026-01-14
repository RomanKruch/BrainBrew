import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, versionKey: false })
export class Text extends Document {
  @Prop({ required: true })
  content: string;

  @Prop({ default: true })
  active: boolean;

  @Prop({ default: 'admin' })
  author: string;

  @Prop({ type: [String], default: [] })
  tags: string[];
}

export const TextSchema = SchemaFactory.createForClass(Text);
