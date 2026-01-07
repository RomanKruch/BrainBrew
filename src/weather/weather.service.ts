import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class WeatherService {
  constructor(private readonly http: HttpService) {}

  async getTodayWeather(lat: number, lon: number): Promise<string> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`;

  const res = await firstValueFrom(this.http.get(url));
  const data = res.data.current_weather;

  const temp = Math.round(data.temperature);
  const wind = Math.round(data.windspeed);
  const desc = this.mapWeatherCode(data.weathercode);

  return `<b>Погода сьогодні:</b> ${temp}°C, ${desc}, вітер ${wind} м/с\n\n`;
}

  private mapWeatherCode(code: number): string {
    const map: Record<number, string> = {
      0: 'ясно',
      1: 'переважно ясно',
      2: 'мінлива хмарність',
      3: 'хмарно',
      45: 'туман',
      48: 'іній',
      51: 'дрібний дощ',
      61: 'дощ',
      71: 'сніг',
      95: 'гроза',
    };

    return map[code] || 'невідомо';
  }
}