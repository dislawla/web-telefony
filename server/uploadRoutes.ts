import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db } from './db';
import { users } from './schema';
import { eq } from 'drizzle-orm';

const router = express.Router();

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/avatars');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB лимит
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Недопустимый тип файла. Разрешены только JPEG, PNG и GIF.'));
    }
  }
});

// Эндпоинт загрузки аватара
router.post('/avatar', upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не был загружен' });
    }

    const userId = req.user?.id;
    if (!userId) {
      // Удаляем загруженный файл, если пользователь не авторизован
      fs.unlinkSync(req.file.path);
      return res.status(401).json({ error: 'Не авторизован' });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // Обновляем URL аватара пользователя в базе данных
    await db.update(users)
      .set({ avatar_url: avatarUrl })
      .where(eq(users.id, userId));

    res.json({ 
      success: true, 
      message: 'Аватар успешно загружен',
      avatarUrl 
    });
  } catch (error) {
    console.error('Ошибка при загрузке аватара:', error);
    
    // Удаляем загруженный файл при ошибке
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      error: 'Ошибка при загрузке аватара',
      details: error instanceof Error ? error.message : 'Неизвестная ошибка'
    });
  }
});

export default router; 