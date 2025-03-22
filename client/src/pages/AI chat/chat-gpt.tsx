import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';

interface Session {
  id: number;
  client_id: number;
  title: string;
  header?: string;
  created_at: string;
  updated_at: string;
}

export default function ChatGptPage() {
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<number | null>(null);

  useEffect(() => {
    async function fetchSessions() {
      try {
        const response = await fetch('/api/ai/sessions');
        const sessionsData = await response.json();
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

  const sendMessage = async () => {
    // Проверяем, что введен текст и выбрана сессия
    if (!prompt.trim() || !selectedSession) return;
    
    setIsLoading(true);

    try {
      // Выполняем запрос к API ChatGPT
      const response = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt, sessionId: selectedSession })
      });
      
      const data = await response.json();
      
      if (data && data.reply) {
        setReply(data.reply);
      } else {
        setReply('Извините, произошла ошибка при обработке вашего запроса.');
        console.error("Некорректный ответ от API:", data);
      }
    } catch (error) {
      setReply('Извините, не удалось связаться с сервером.');
      console.error("Ошибка при отправке сообщения:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Отправка сообщения происходит по нажатию на кнопку, а также по нажатию Enter (без Shift)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-8">
        <div>
          <h1 className="text-3xl font-bold">Chat GPT</h1>
          <p className="mb-4">
            Введите сообщение для ChatGPT:
          </p>
          
          <div className="mb-4">
            <label htmlFor="session-select" className="block mb-2 font-medium">Выберите сессию: </label>
            <select 
              id="session-select" 
              value={selectedSession || ""} 
              onChange={handleSessionChange}
              className="w-full border rounded px-3 py-2 text-gray-900"
              disabled={isLoading || sessions.length === 0}
            >
              {!sessions.length && <option value="">Нет доступных сессий</option>}
              {sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.header ? session.header : session.title}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="border rounded-lg p-6 bg-white">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full border rounded px-3 py-2 min-h-[120px] resize-none mb-4 text-gray-900"
            placeholder="Введите ваш запрос..."
            disabled={isLoading}
          />
          <button 
            onClick={sendMessage}
            type="button"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:bg-blue-400"
            disabled={isLoading}
          >
            {isLoading ? 'Отправка...' : 'Отправить'}
          </button>
          
          {reply && (
            <div className="mt-6 p-4 border rounded-lg bg-gray-50 text-gray-900">
              <h2 className="font-semibold mb-2">Ответ ChatGPT:</h2>
              <div className="whitespace-pre-wrap">{reply}</div>
            </div>
          )}
          
          {isLoading && (
            <div className="mt-6 p-4 border rounded-lg bg-gray-50 text-gray-900">
              <div className="flex items-center justify-center">
                <span className="inline-block animate-pulse text-lg">Загрузка ответа...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
