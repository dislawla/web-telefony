import dotenv from 'dotenv';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

// Загружаем переменные окружения
dotenv.config();

async function testSpeechKit() {
  try {
    console.log('Starting SpeechKit API test...');
    
    const apiKey = process.env.YANDEX_API_KEY;
    const folderId = process.env.YANDEX_FOLDER_ID;

    if (!apiKey || !folderId) {
      console.error('YANDEX_API_KEY or YANDEX_FOLDER_ID is not set in .env file');
      return;
    }

    console.log('API Key and Folder ID are set correctly');

    // Путь к тестовому аудио файлу
    const testAudioPath = path.join(__dirname, '../uploads');
    const files = fs.readdirSync(testAudioPath);
    
    if (files.length === 0) {
      console.error('No audio files found in uploads directory');
      return;
    }

    // Берем первый найденный аудио файл
    const audioFile = files[0];
    console.log('Using audio file:', audioFile);

    const audioData = fs.readFileSync(path.join(testAudioPath, audioFile));
    const base64Audio = audioData.toString('base64');

    console.log('Sending request to SpeechKit API...');
    const response = await axios.post(
      'https://stt.api.cloud.yandex.net/speech/v1/stt/recognize',
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
          Authorization: `Api-Key ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('API Response:', response.data);
    console.log('Test completed successfully!');
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
    } else {
      console.error('Error:', error);
    }
  }
}

// Запускаем тест
testSpeechKit(); 