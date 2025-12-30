import { Injectable, OnModuleInit } from '@nestjs/common';
import { Telegraf } from 'telegraf';
import { UserService } from '../user/user.service';

@Injectable()
export class BotService implements OnModuleInit {
  private bot: Telegraf;

  constructor(private readonly userService: UserService) {}

  async onModuleInit() {
    this.bot = new Telegraf(process.env.BOT_TOKEN!);

    this.bot.start(async (ctx) => {
      await this.userService.findOrCreate(ctx.from.id);
      ctx.reply('☕🧠 BrainBrew готовий! Напиши /topics щоб обрати теми.');
    });

    await this.bot.launch();
  }
}
