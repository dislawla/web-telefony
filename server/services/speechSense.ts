import axios from 'axios';
import fs from 'fs';

export class SpeechSenseService {
  private readonly apiKey: string;
  private readonly folderId: string;
  private readonly baseUrl = 'https://stt.api.cloud.yandex.net';

  constructor() {
    if (!process.env.SPEECHSENSE_API_KEY) {
      throw new Error('SPEECHSENSE_API_KEY is not set');
    }
    if (!process.env.YANDEX_FOLDER_ID) {
      throw new Error('YANDEX_FOLDER_ID is not set');
    }
    this.apiKey = process.env.SPEECHSENSE_API_KEY;
    this.folderId = process.env.YANDEX_FOLDER_ID;
    console.log('SpeechSense service initialized with API key and folder ID');
  }

  async recognizeAudio(filePath: string): Promise<string> {
    try {
      console.log('Reading audio file:', filePath);
      const audioData = fs.readFileSync(filePath);
      const base64Audio = audioData.toString('base64');
      console.log('Audio file converted to base64');

      console.log('Sending request to SpeechSense API...');
      const response = await axios.post(
        `${this.baseUrl}/speech/v1/stt:recognize`,
        {
          config: {
            specification: {
              languageCode: 'ru-RU',
              model: 'general',
              audioEncoding: 'LINEAR16_PCM',
              sampleRateHertz: 8000,
              profanityFilter: false,
            },
            folderId: this.folderId
          },
          audio: {
            content: base64Audio
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000, // 30 секунд таймаут
        }
      );

      console.log('Received response from SpeechSense API:', response.data);

      if (!response.data || !response.data.result) {
        throw new Error('Invalid response from SpeechSense API');
      }

      return response.data.result;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('SpeechSense API Error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
        });
        throw new Error(`SpeechSense API Error: ${error.response?.data?.error || error.message}`);
      }
      console.error('Error recognizing audio with SpeechSense:', error);
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
        confidence: 1.0, // SpeechSense не возвращает уровень уверенности
      };
    } catch (error) {
      console.error('Error getting transcription with SpeechSense:', error);
      throw error;
    }
  }
} 