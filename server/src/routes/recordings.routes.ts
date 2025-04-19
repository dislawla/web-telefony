import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { uploadRecording, getRecordings } from '../controllers/recordings.controller';

const router = express.Router();

// Создаем директорию для загрузок, если её нет
const uploadsDir = path.join(__dirname, '../../../uploads');
const recordingsDir = path.join(uploadsDir, 'recordings');

[uploadsDir, recordingsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, recordingsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Маршруты для работы с записями
router.post('/upload', upload.single('audio'), uploadRecording);
router.get('/user/:userId', getRecordings);

// Маршрут для доступа к файлам
router.get('/uploads/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(recordingsDir, filename);
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

export default router; 