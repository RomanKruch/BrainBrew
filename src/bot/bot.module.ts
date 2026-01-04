import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { UserModule } from '../user/user.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [UserModule, AiModule],
  providers: [BotService],
})
export class BotModule {}
