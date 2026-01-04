import { Injectable } from '@nestjs/common';
import fetch from 'node-fetch';

@Injectable()
export class GeminiService {
   /**
   * Генерує текст для саморозвитку на основі тем користувача
   * @param topics масив тем, наприклад ['бізнес', 'мотивація']
   * @returns згенерований текст
   */
  async generateText(topics: string[]): Promise<string> {
    const prompt = `Напиши короткий, цікавий і практичний текст українською! для саморозвитку (5–10 хв читання).
Теми: ${topics.join(', ')}.
Стиль: дружній, простий, без води, з підзаголовками.`;

    // Запит до локального Ollama API
    const res = await fetch('http://127.0.0.1:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3',   // модель, яку ти завантажив через ollama pull llama3
        prompt,
        stream: false,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Ollama API error ${res.status}: ${text}`);
    }

    const data = await res.json();

    if (!data.response) {
      throw new Error('Unexpected Ollama response: ' + JSON.stringify(data));
    }

    return data.response.trim();
  }
}
