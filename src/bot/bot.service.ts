import { Injectable, OnModuleInit } from '@nestjs/common';
import { Telegraf } from 'telegraf';
import * as cron from 'node-cron';
import { UserService } from '../user/user.service';
import { TextService } from '../text/text.service';

@Injectable()
export class BotService implements OnModuleInit {
  private bot: Telegraf;

  constructor(
    private readonly userService: UserService,
    private readonly textService: TextService,
  ) {}

  async onModuleInit() {
    this.bot = new Telegraf(process.env.BOT_TOKEN!);

    this.registerCommands();

    setImmediate(async () => {
      await this.bot.launch();
      console.log('Bot launched');
    });
    this.scheduleDailyText();
  }

  private registerCommands() {
    this.bot.start(this.onStart);
    this.bot.command('text', this.sendText);
    this.bot.on('callback_query', this.handleCallbackQuery);
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

  private sendText = async ctx => {
    try {
      // 1️⃣ Отримуємо користувача
      const user = await this.userService.findOrCreate(ctx.from.id);

      // 2️⃣ Отримуємо текст, який юзер ще не бачив
      const text = await this.textService.getOneNotSeen(user.seenTexts);
      if (!text) {
        return ctx.reply('Немає нових текстів для тебе 😔');
      }

      // 3️⃣ Позначаємо текст як прочитаний
      await this.userService.markAsRead(user._id, text._id);

      // 4️⃣ Відправляємо текст з кнопками лайк/дизлайк
      await ctx.reply(text.content, {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '👍 Лайк', callback_data: `like:${text._id}` },
              { text: '👎 Дизлайк', callback_data: `dislike:${text._id}` },
            ],
          ],
        },
      });
    } catch (error) {
      console.error('Error in /text:', error);
      await ctx.reply('❌ Сталася помилка при генерації тексту.');
    }
  };

  private handleCallbackQuery = async ctx => {
    try {
      const user = await this.userService.findOrCreate(ctx.from.id);
      const data = ctx.callbackQuery.data; // наприклад "like:12345"
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

  private scheduleDailyText = () => {
    cron.schedule('0 7 * * *', async () => {
      try {
        console.log('Запускаємо щоденну розсилку текстів');

        const users = await this.userService.findAllUsers(); // треба зробити метод, який повертає всіх користувачів
        for (const user of users) {
          const text = await this.textService.getOneNotSeen(user.seenTexts);
          if (text) {
            await this.bot.telegram.sendMessage(user.telegramId, text.content, {
              reply_markup: {
                inline_keyboard: [
                  [
                    { text: '👍 Лайк', callback_data: `like:${text._id}` },
                    { text: '👎 Дизлайк', callback_data: `dislike:${text._id}` },
                  ],
                ],
              },
            });

            // Позначаємо текст як прочитаний
            await this.userService.markAsRead(user._id, text._id);
          }
        }
      } catch (err) {
        console.error('Помилка розсилки:', err);
      }
    });
  };
}
