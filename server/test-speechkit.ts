import { SpeechKitService } from './services/speechKit';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Загружаем переменные окружения
dotenv.config();

async function testSpeechKit() {
  try {
    console.log('Starting SpeechKit test...');
    
    // Создаем экземпляр сервиса
    const speechKit = new SpeechKitService();
    console.log('SpeechKit service initialized successfully');

    // Путь к тестовому аудио файлу
    const testAudioPath = path.join(__dirname, 'test-audio.wav');
    
    // Проверяем существование файла
    if (!fs.existsSync(testAudioPath)) {
      console.error('Test audio file not found. Please place a test-audio.wav file in the server directory.');
      return;
    }

    console.log('Testing audio recognition...');
    const result = await speechKit.recognizeAudio(testAudioPath);
    
    console.log('Recognition result:', result);
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Запускаем тест
testSpeechKit(); 