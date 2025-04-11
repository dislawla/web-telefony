import React, { useState, useEffect } from "react";
import apiRequest from "../utils/apiRequest";

interface Session {
  id: number;
  client_id: number;
  title: string;
  header?: string;
  created_at: string;
  updated_at: string;
}

const ChatGPT: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [responseText, setResponseText] = useState("");

  useEffect(() => {
    async function fetchSessions() {
      try {
        const sessionsData = await apiRequest("GET", "/api/ai/sessions");
        setSessions(sessionsData);
        if (sessionsData.length > 0) {
          setSelectedSession(sessionsData[0].id);
        }
      } catch (error) {
        console.error("Ошибка при загрузке сессий:", error);
      }
    }
    fetchSessions();
  }, []);

  const handleSessionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSession(Number(e.target.value));
  };

  const handleSendMessage = async () => {
    // Проверяем, что сообщение не пустое
    if (!message.trim()) {
      return;
    }

    try {
      const result = await apiRequest("POST", "/api/ai/ask", { message, sessionId: selectedSession });
      setResponseText(result.answer);
    } catch (error) {
      console.error("Ошибка при отправке сообщения:", error);
    }
  };

  return (
    <div>
      <h1>ChatGPT</h1>
      <label htmlFor="session-select">Выберите сессию: </label>
      <select id="session-select" value={selectedSession || ""} onChange={handleSessionChange}>
        {sessions.map((session) => (
          <option key={session.id} value={session.id}>
            {session.header ? session.header : session.title}
          </option>
        ))}
      </select>
      <div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Введите сообщение..."
          rows={4}
          cols={50}
        />
      </div>
      <button onClick={handleSendMessage}>Отправить сообщение</button>
      {responseText && (
        <div>
          <h3>Ответ ChatGPT:</h3>
          <p>{responseText}</p>
        </div>
      )}
    </div>
  );
};

export default ChatGPT;