import { Injectable, OnModuleInit } from '@nestjs/common';
import { Telegraf } from 'telegraf';
import { UserService } from '../user/user.service';
import { TOPICS } from '../content/topics';


@Injectable()
export class BotService implements OnModuleInit {
  private bot: Telegraf;

  constructor(private readonly userService: UserService) {}

  async onModuleInit() {
    this.bot = new Telegraf(process.env.BOT_TOKEN!);

    this.registerCommands();

    await this.bot.launch();
    console.log('☕🧠 BrainBrew bot started');
  }

  private registerCommands() {
    this.bot.start(this.onStart);
    this.bot.command('topics', this.sendTopics);
    this.bot.action(/topic:(.+)/, this.onTopicSelect);
  }

  // ================= Handlers =================

  private onStart = async (ctx) => {
    try {
      await this.userService.findOrCreate(ctx.from.id);
      await ctx.reply(
        '☕🧠 Вітаю в BrainBrew!\nНапиши /topics щоб обрати теми для щоденних матеріалів.'
      );
    } catch (error) {
      console.error('Error in /start:', error);
      await ctx.reply('❌ Сталася помилка при запуску бота.');
    }
  };

  private sendTopics = async (ctx) => {
    try {
      const user = await this.userService.findOrCreate(ctx.from.id);

      await ctx.reply(
        'Обери теми. Натискай — вмикається / вимикається 👇',
        this.buildTopicsKeyboard(user.topics),
      );
    } catch (error) {
      console.error('Error in /topics command:', error);
      await ctx.reply('❌ Сталася помилка, спробуй ще раз.');
    }
  };

  private onTopicSelect = async (ctx) => {
    try {
      const topic = ctx.match[1];
      const telegramId = ctx.from.id;

      const user = await this.userService.findOrCreate(telegramId);

      const topics = user.topics.includes(topic)
        ? user.topics.filter((t) => t !== topic)
        : [...user.topics, topic];

      await this.userService.updateTopics(telegramId, topics);

      await ctx.editMessageReplyMarkup(this.buildTopicsKeyboard(topics).reply_markup);
    } catch (error) {
      console.error('Error in topic toggle:', error);
    }
  };

  // ================= Utility =================

  private buildTopicsKeyboard(activeTopics: string[]) {
    return {
      reply_markup: {
        inline_keyboard: TOPICS.map((topic) => [
          {
            text: activeTopics.includes(topic) ? `✅ ${topic}` : topic,
            callback_data: `topic:${topic}`,
          },
        ]),
      },
    };
  }
}
