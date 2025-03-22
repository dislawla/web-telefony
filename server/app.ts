import express from "express";
import { askChatGPT } from "./api/askChatGPT";

const app = express();
app.use(express.json()); // для парсинга JSON-тел запросов

app.post("/api/ask", async (req, res) => {
  const { prompt } = req.body;
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