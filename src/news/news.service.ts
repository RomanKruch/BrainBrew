import { Injectable } from '@nestjs/common';
import Parser from 'rss-parser';

@Injectable()
export class NewsService {
  private parser = new Parser();

  async getTopNews(limit = 3): Promise<string> {
    const feed = await this.parser.parseURL('https://www.pravda.com.ua/rss/');

    const news = `<b>Головні новини:</b>\n${feed.items
      .slice(0, limit)
      .map(item => {
        const title = item.title?.trim();
        const link = item.link;
        return `• <a href="${link}">${title}</a>`;
      })
      .join('\n')}\n\n`;

    return news || '';
  }
}
