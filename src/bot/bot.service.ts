import { Injectable, OnModuleInit } from '@nestjs/common';
import { Telegraf } from 'telegraf';

@Injectable()
export class BotService implements OnModuleInit {
  private bot: Telegraf;

  async onModuleInit() {
    this.bot = new Telegraf(process.env.BOT_TOKEN!);

    this.bot.start((ctx) => ctx.reply('☕🧠 BrainBrew готовий! Напиши /help'));

    this.bot.command('help', (ctx) =>
      ctx.reply('Команди:\n/start — старт\n/help — допомога')
    );

    await this.bot.launch();
    console.log('BrainBrew bot started');
  }
}
