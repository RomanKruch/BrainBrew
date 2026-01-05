import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { UserModule } from '../user/user.module';
import { TextModule } from '../text/text.module';
import { WeatherModule } from '../weather/weather.module';

@Module({
  imports: [UserModule, TextModule, WeatherModule],
  providers: [BotService],
})
export class BotModule {}
