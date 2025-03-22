import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';

export default function ChatGptPage() {
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);

    try {
      // Отправляем запрос к API Chat GPT
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt })
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

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
        </div>
        
        <div className="border rounded-lg p-6 bg-white">
          <form onSubmit={handleSubmit}>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full border rounded px-3 py-2 min-h-[120px] resize-none mb-4 text-gray-900"
              placeholder="Введите ваш запрос..."
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:bg-blue-400"
              disabled={isLoading || !prompt.trim()}
            >
              {isLoading ? 'Отправка...' : 'Отправить'}
            </button>
          </form>
          
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
