import dotenv from "dotenv";
dotenv.config();

import express, { type Request, Response, NextFunction } from "express";
import setupRoutes from "./routes/index";
import { setupVite, serveStatic, log } from "./vite";
import http from "http";
import { askChatGPT } from "./api/askChatGPT";


const app = express();
const PORT = Number(process.env.PORT) || 3000; // Убедитесь, что установлен правильный порт

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Настраиваем маршруты через функцию setupRoutes
import { setupAuth } from "./auth"; // Импорт setupAuth
setupAuth(app); // Добавляем настройку аутентификации перед маршрутами
setupRoutes(app);

// Обработчик маршрута /api/ask
app.post("/api/ask", async (req: Request, res: Response) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ message: "Нет запроса" });
  }
  try {
    const reply = await askChatGPT(prompt);
    res.json({ reply });
  } catch (error: any) {
    // Вывод подробных данных об ошибке в консоль
    console.error("Ошибка запроса к OpenAI:", error?.response?.data || error.message);
    res.status(500).json({ message: "Ошибка связи с ChatGPT" });
  }
});

// Включить CORS для разработки
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Middleware для обработки ошибок
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

// Создаем HTTP-сервер на основе Express-приложения
const server = http.createServer(app);

(async () => {
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  server.listen(PORT, "127.0.0.1", () => {
    console.log(`Сервер запущен на порту ${PORT}`);
  });
})();
