import axios from 'axios';
import fs from 'fs';
import path from 'path';

export class SpeechKitService {
  private readonly apiKey: string;
  private readonly folderId: string;
  private readonly baseUrl = 'https://stt.api.cloud.yandex.net/speech/v1/stt/recognize';

  constructor() {
    if (!process.env.YANDEX_API_KEY) {
      throw new Error('YANDEX_API_KEY is not set');
    }
    if (!process.env.YANDEX_FOLDER_ID) {
      throw new Error('YANDEX_FOLDER_ID is not set');
    }

    this.apiKey = process.env.YANDEX_API_KEY;
    this.folderId = process.env.YANDEX_FOLDER_ID;
  }

  async recognizeAudio(filePath: string): Promise<string> {
    try {
      const audioData = fs.readFileSync(filePath);
      const base64Audio = audioData.toString('base64');

      const response = await axios.post(
        this.baseUrl,
        {
          config: {
            specification: {
              languageCode: 'ru-RU',
              model: 'general',
              profanityFilter: true,
              audioEncoding: 'LINEAR16_PCM',
              sampleRateHertz: 8000,
            },
          },
          audio: {
            content: base64Audio,
          },
        },
        {
          headers: {
            Authorization: `Api-Key ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.result;
    } catch (error) {
      console.error('Error recognizing audio:', error);
      throw error;
    }
  }

  async getTranscription(filePath: string): Promise<{
    text: string;
    confidence: number;
  }> {
    try {
      const result = await this.recognizeAudio(filePath);
      return {
        text: result,
        confidence: 1.0, // Yandex Speech Kit не возвращает уровень уверенности
      };
    } catch (error) {
      console.error('Error getting transcription:', error);
      throw error;
    }
  }
} 