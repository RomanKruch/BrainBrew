import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { UserModule } from '../user/user.module';
import { TextModule } from '../text/text.module';
import { WeatherModule } from '../weather/weather.module';
import { NewsModule } from '../news/news.module';

@Module({
  imports: [UserModule, TextModule, WeatherModule, NewsModule],
  providers: [BotService],
})
export class BotModule {}
