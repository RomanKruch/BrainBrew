import { Injectable, OnModuleInit } from '@nestjs/common';
import { Telegraf } from 'telegraf';
import * as cron from 'node-cron';
import { UserService } from '../user/user.service';
import { TextService } from '../text/text.service';
import { WeatherService } from '../weather/weather.service';
import { User } from '../user/user.schema';
import { NewsService } from '../news/news.service';

@Injectable()
export class BotService implements OnModuleInit {
  private bot: Telegraf;

  constructor(
    private readonly userService: UserService,
    private readonly textService: TextService,
    private readonly weatherService: WeatherService,
    private readonly newsService: NewsService,
  ) {}

  async onModuleInit() {
    this.bot = new Telegraf(process.env.BOT_TOKEN!);

    this.registerCommands();

    setImmediate(async () => {
      await this.bot.launch();
    });

    this.scheduleDailyText();
  }

  private registerCommands() {
    this.bot.start(this.onStart);
    this.bot.command('text', async ctx => {
      this.sendText(await this.userService.findOrCreate(ctx.from.id));
    });
    this.bot.command('location', this.getLocation);
    this.bot.on('callback_query', this.handleCallbackQuery);
    this.bot.on('location', this.handleLocation);
  }

  // ================= Handlers =================

  private onStart = async ctx => {
    try {
      await this.userService.findOrCreate(ctx.from.id);
      console.log(1);
      await ctx.reply('☕🧠 Вітаю в BrainBrew!');
    } catch (error) {
      console.error('Error in /start:', error);
      await ctx.reply('❌ Сталася помилка при запуску бота.');
    }
  };

  private sendText = async (user: User) => {
    try {
      const { lat, lon } = user;
      const weather = lat && lon ? await this.weatherService.getTodayWeather(lat, lon) : '';

      const news = await this.newsService.getTopNews(5);

      const text = await this.textService.getOneNotSeen(user.seenTexts);
      if (!text) {
        return this.bot.telegram.sendMessage(user.telegramId, 'Немає нових текстів для тебе 😔');
      }

      await this.userService.markAsRead(user._id, text._id);

      await this.bot.telegram.sendMessage(
        user.telegramId,
        `${weather}${news}<b>Твій текст дня:</b>\n\n${text.content}`,
        {
          link_preview_options: {
            is_disabled: true,
          },
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [
                { text: '👍 Лайк', callback_data: `like:${text._id}` },
                { text: '👎 Дизлайк', callback_data: `dislike:${text._id}` },
              ],
            ],
          },
        },
      );
    } catch (error) {
      console.error('Error in /text:', error);
      await this.bot.telegram.sendMessage(
        user.telegramId,
        '❌ Сталася помилка при генерації тексту.',
      );
    }
  };

  private getLocation = async ctx => {
    await ctx.reply('📍 Надішли свою локацію, щоб я показував погоду для твого регіону:', {
      reply_markup: {
        keyboard: [[{ text: '📍 Надіслати локацію', request_location: true }]],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    });
  };

  private handleCallbackQuery = async ctx => {
    try {
      const user = await this.userService.findOrCreate(ctx.from.id);
      const data = ctx.callbackQuery.data;
      const [action, textId] = data.split(':');

      if (action === 'like') {
        await this.userService.likeText(user._id, textId);
        await ctx.reply('Ти лайкнув текст ✅');
      } else if (action === 'dislike') {
        await this.userService.dislikeText(user._id, textId);
        await ctx.reply('Ти дизлайкнув текст ❌');
      }
    } catch (error) {
      console.error('Error handling callback:', error);
      await ctx.answerCbQuery('Сталася помилка ❌');
    }
  };

  private handleLocation = async ctx => {
    const { latitude, longitude } = ctx.message.location;

    await this.userService.updateLocation(ctx.from.id, latitude, longitude);

    await ctx.reply('✅ Локацію збережено! Тепер я показуватиму погоду для твого регіону 😊', {
      reply_markup: { remove_keyboard: true },
    });
  };

  private scheduleDailyText = () => {
    cron.schedule('0 5 * * *', async () => {
      try {
        const users = await this.userService.findAllUsers();
        for (const user of users) {
          this.sendText(user);
        }
      } catch (err) {
        console.error('Помилка розсилки:', err);
      }
    });
  };
}
