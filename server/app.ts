import express from "express";
import cors from "cors";
import { askChatGPT } from "./api/askChatGPT";

const app = express();

// Middleware для CORS (Cross-Origin Resource Sharing)
app.use(cors());

// Middleware для парсинга JSON тел запросов
app.use(express.json());

app.post("/api/ask", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ message: "Нет запроса" });
  }
  try {
    const reply = await askChatGPT(prompt);
    res.json({ reply });
  } catch (error) {
    console.error("Ошибка GPT:", error);
    res.status(500).json({ message: "Ошибка при запросе к ChatGPT" });
  }
});

// Другие маршруты и настройки сервера

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
