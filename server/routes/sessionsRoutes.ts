import { Router } from "express";
// Предполагается, что модуль db предоставляет подключение к базе (например, pg.Pool)
import db from "../db";

const router = Router();

router.get("/sessions", async (req, res) => {
  try {
    const result = await db.query("SELECT id, client_id, title, header, created_at, updated_at FROM ai_sessions_client ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (error: any) {
    console.error("Ошибка получения сессий:", error.message);
    res.status(500).json({ message: "Ошибка получения сессий" });
  }
});

export default router;