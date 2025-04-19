import { Router } from "express";
import multer from "multer";
import path from "path";
import { nanoid } from "nanoid";
import { db } from "../db";
import { recordings } from "@shared/schema";
import { eq } from "drizzle-orm";
import { SpeechKitService } from "../services/speechKit";

const router = Router();
const speechKit = new SpeechKitService();

// Настройка multer для сохранения аудиофайлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), "uploads", "recordings"));
  },
  filename: (req, file, cb) => {
    const uniqueId = nanoid();
    cb(null, `${uniqueId}.wav`);
  },
});

const upload = multer({ storage });

// Загрузка новой записи
router.post("/upload", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No audio file provided" });
    }

    const { userId, callId } = req.body;
    if (!userId || !callId) {
      return res.status(400).json({ message: "userId and callId are required" });
    }

    // Создаем транскрипцию
    let transcription = null;
    try {
      const result = await speechKit.getTranscription(req.file.path);
      transcription = result.text;
    } catch (error) {
      console.error("Error creating transcription:", error);
      // Продолжаем без транскрипции, если возникла ошибка
    }

    const [recording] = await db
      .insert(recordings)
      .values({
        userId: parseInt(userId),
        callId: parseInt(callId),
        filePath: req.file.path,
        fileName: req.file.filename,
        duration: 0, // TODO: Calculate duration
        transcription,
        createdAt: new Date(),
      })
      .returning();

    res.json(recording);
  } catch (error) {
    console.error("Error uploading recording:", error);
    res.status(500).json({ message: "Error uploading recording" });
  }
});

// Получение списка записей для пользователя
router.get("/user/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const userRecordings = await db
      .select()
      .from(recordings)
      .where(eq(recordings.userId, userId))
      .orderBy(recordings.createdAt);

    res.json(userRecordings);
  } catch (error) {
    console.error("Error fetching recordings:", error);
    res.status(500).json({ message: "Error fetching recordings" });
  }
});

// Получение конкретной записи
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [recording] = await db
      .select()
      .from(recordings)
      .where(eq(recordings.id, id));

    if (!recording) {
      return res.status(404).json({ message: "Recording not found" });
    }

    res.json(recording);
  } catch (error) {
    console.error("Error fetching recording:", error);
    res.status(500).json({ message: "Error fetching recording" });
  }
});

export default router; 