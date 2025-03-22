import { Router } from "express";
import OpenAI from "openai";
import { pool } from "../db"; // Import database connection

const router = Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/ask", async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || !sessionId) {
      return res.status(400).json({ message: "Отсутствует сообщение или идентификатор сессии" });
    }

    // 1. Save the user's message to the database
    await pool.query(
      "INSERT INTO ai_sessions_client (client_id, role, content) VALUES ($1, $2, $3)",
      [sessionId, "user", message]
    );

    // 2. Retrieve the last 10 messages for context
    const { rows } = await pool.query(
      "SELECT role, content FROM ai_sessions_client WHERE client_id = $1 ORDER BY created_at ASC LIMIT 10",
      [sessionId]
    );

    const chatHistory = rows.map((row) => ({
      role: row.role,
      content: row.content,
    }));

    // 3. Add the current message to the chat history if not already included
    if (chatHistory.length === 0 || chatHistory[chatHistory.length - 1].content !== message) {
      chatHistory.push({ role: "user", content: message });
    }

    // 4. Query ChatGPT
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: chatHistory,
    });

    const assistantMessage = completion.choices[0].message?.content;

    // 5. Save the assistant's response to the database
    await pool.query(
      "INSERT INTO ai_sessions_client (client_id, role, content) VALUES ($1, $2, $3)",
      [sessionId, "assistant", assistantMessage]
    );

    res.json({ reply: assistantMessage });
  } catch (error) {
    console.error("ChatGPT Error:", error?.response?.data || error.message);
    res.status(500).json({ message: "Ошибка при обращении к OpenAI или сохранении сообщения" });
  }
});

export default router;
