import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { UserModule } from '../user/user.module';
import { TextModule } from '../text/text.module';

@Module({
  imports: [UserModule, TextModule],
  providers: [BotService],
})
export class BotModule {}
