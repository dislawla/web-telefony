import { SpeechSenseService } from './services/speechSense';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Загружаем переменные окружения из корневой директории
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testSpeechSense() {
  try {
    console.log('Starting SpeechSense test...');
    
    // Проверяем API ключ
    const apiKey = process.env.SPEECHSENSE_API_KEY;
    if (!apiKey) {
      throw new Error('SPEECHSENSE_API_KEY is not set in .env file');
    }
    console.log('API Key is set');

    // Проверяем folder ID
    const folderId = process.env.YANDEX_FOLDER_ID;
    if (!folderId) {
      throw new Error('YANDEX_FOLDER_ID is not set in .env file');
    }
    console.log('Folder ID is set');

    // Создаем экземпляр сервиса
    const speechSense = new SpeechSenseService();
    console.log('SpeechSense service initialized successfully');

    // Создаем тестовую директорию, если её нет
    const testDir = path.join(__dirname, 'test');
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir);
    }

    // Создаем тестовый WAV файл с синусоидальным сигналом (1 секунда, 8кГц)
    const sampleRate = 8000;
    const duration = 1; // секунды
    const frequency = 440; // частота сигнала (440 Гц - нота ля первой октавы)
    const numSamples = sampleRate * duration;
    const buffer = Buffer.alloc(44 + numSamples * 2); // 44 байта заголовка WAV + данные

    // Записываем заголовок WAV
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + numSamples * 2, 4); // размер файла
    buffer.write('WAVE', 8);
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16); // размер fmt чанка
    buffer.writeUInt16LE(1, 20); // PCM формат
    buffer.writeUInt16LE(1, 22); // моно
    buffer.writeUInt32LE(sampleRate, 24); // частота дискретизации
    buffer.writeUInt32LE(sampleRate * 2, 28); // байт в секунду
    buffer.writeUInt16LE(2, 32); // байт на сэмпл
    buffer.writeUInt16LE(16, 34); // бит на сэмпл
    buffer.write('data', 36);
    buffer.writeUInt32LE(numSamples * 2, 40); // размер data чанка

    // Заполняем данные синусоидальным сигналом
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const amplitude = 32767 * 0.5; // Половина максимальной амплитуды для 16-bit
      const sample = Math.sin(2 * Math.PI * frequency * t) * amplitude;
      buffer.writeInt16LE(Math.floor(sample), 44 + i * 2);
    }

    const testFile = path.join(testDir, 'test.wav');
    fs.writeFileSync(testFile, buffer);
    console.log('Created test WAV file:', testFile);

    // Тестируем распознавание
    console.log('Testing audio recognition...');
    const result = await speechSense.recognizeAudio(testFile);
    console.log('Recognition result:', result);

    // Очищаем тестовые файлы
    fs.unlinkSync(testFile);
    fs.rmdirSync(testDir);
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
  }
}

// Запускаем тест
testSpeechSense(); 