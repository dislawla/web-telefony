import express from 'express';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import path from 'path';
import fs from 'fs';
import recordingsRoutes from './routes/recordings.routes';

const app = express();
const port = process.env.PORT || 3001;

// Создаем необходимые директории
const UPLOADS_DIR = path.join(__dirname, '../../uploads');
const RECORDINGS_DIR = path.join(UPLOADS_DIR, 'recordings');

[UPLOADS_DIR, RECORDINGS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

app.use(cors());
app.use(express.json());
app.use(fileUpload());

// Настраиваем статические файлы
app.use('/uploads', express.static(UPLOADS_DIR));

// Маршруты
app.use('/api/recordings', recordingsRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Uploads directory: ${UPLOADS_DIR}`);
  console.log(`Recordings directory: ${RECORDINGS_DIR}`);
}); 