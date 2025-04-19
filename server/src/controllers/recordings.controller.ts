import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { SpeechSenseService } from '../../services/speechSense';
import path from 'path';
import fs from 'fs';

const speechSense = new SpeechSenseService();

// Создаем базовую директорию для загрузок
const UPLOADS_DIR = path.join(__dirname, '../../../uploads');
const RECORDINGS_DIR = path.join(UPLOADS_DIR, 'recordings');

// Создаем необходимые директории
[UPLOADS_DIR, RECORDINGS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

export const uploadRecording = async (req: Request, res: Response) => {
  try {
    if (!req.files || !('audio' in req.files)) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const audioFile = req.files.audio as any;
    const userId = parseInt(req.body.userId);
    const callId = parseInt(req.body.callId || '1');

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Проверяем существование пользователя
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Генерируем уникальное имя файла
    const filename = `${Date.now()}-${audioFile.name}`;
    const filePath = path.join(RECORDINGS_DIR, filename);

    // Сохраняем файл
    await audioFile.mv(filePath);
    console.log('File saved to:', filePath);

    try {
      // Распознаем аудио с помощью SpeechSense
      const transcription = await speechSense.recognizeAudio(filePath);
      console.log('Transcription received:', transcription);

      // Сохраняем запись в базу данных
      const recording = await prisma.recording.create({
        data: {
          userId,
          callId,
          filePath,
          fileName: filename,
          transcription,
        },
      });

      console.log('Recording saved to database:', recording);

      res.json({
        id: recording.id,
        createdAt: recording.createdAt,
        filename,
        transcription,
      });
    } catch (error) {
      // Если произошла ошибка при распознавании или сохранении в БД,
      // удаляем загруженный файл
      fs.unlinkSync(filePath);
      throw error;
    }
  } catch (error) {
    console.error('Error uploading recording:', error);
    res.status(500).json({ 
      error: 'Failed to upload recording',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getRecordings = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    console.log('Fetching recordings for user:', userId);

    // Проверяем существование пользователя
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const recordings = await prisma.recording.findMany({
      where: {
        userId: parseInt(userId),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('Found recordings:', recordings);
    res.json(recordings);
  } catch (error) {
    console.error('Error getting recordings:', error);
    res.status(500).json({ 
      error: 'Failed to get recordings',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 