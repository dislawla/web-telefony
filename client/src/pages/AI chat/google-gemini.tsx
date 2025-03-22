import React, { useState } from 'react';
import DashboardLayout from "@/components/layout/dashboard-layout";

interface Message {
  sender: 'user' | 'google-gemini';
  text: string;
}

export default function GoogleGeminiPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const connectToGemini = async () => {
    if (!apiKey.trim()) {
      alert("Пожалуйста, введите API key.");
      return;
    }
    setIsConnecting(true);
    try {
      // Передаём API key при подключении
      const response = await fetch('/api/google-gemini/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ apiKey })
      });
      const data = await response.json();
      if (data && data.connected) {
        setIsConnected(true);
      } else {
        alert("Не удалось установить соединение с Google Gemini.");
        console.error("Некорректный ответ от API подключения:", data);
      }
    } catch (error) {
      console.error("Ошибка подключения:", error);
      alert("Ошибка при попытке подключения к серверу.");
    } finally {
      setIsConnecting(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !isConnected) return;
    
    // Добавляем сообщение пользователя в историю
    setMessages(prev => [...prev, { sender: 'user', text: input }]);
    setIsLoading(true);

    try {
      // Отправляем запрос к API Google Gemini
      const response = await fetch('/api/google-gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: input })
      });
      
      const data = await response.json();
      
      // Ожидается, что API возвращает ответ в параметре reply
      if (data && data.reply) {
        setMessages(prev => [...prev, { sender: 'google-gemini', text: data.reply }]);
      } else {
        setMessages(prev => [...prev, { 
          sender: 'google-gemini', 
          text: 'Извините, произошла ошибка при обработке вашего запроса.' 
        }]);
        console.error("Некорректный ответ от API:", data);
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        sender: 'google-gemini', 
        text: 'Извините, не удалось связаться с сервером.' 
      }]);
      console.error("Ошибка при отправке сообщения:", error);
    } finally {
      setIsLoading(false);
      setInput("");
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
          <h1 className="text-3xl font-bold">Google Gemini</h1>
          <p className="mb-4">Это страница Google Gemini для раздела AI с возможностью чата через API.</p>
        </div>
        
        {/* Секция настроек подключения */}
        <div className="border rounded-lg p-4 mb-4 bg-white">
          <h2 className="text-xl font-semibold mb-2">Настройки подключения</h2>
          <div className="flex flex-col gap-3">
            <div>
              <label className="block font-medium mb-1">API Key</label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Введите ваш API key"
                className="w-full border rounded px-3 py-2 text-black"
                disabled={isConnected}
              />
            </div>
            {isConnected ? (
              <div className="text-green-600 font-semibold">Соединение установлено.</div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="text-red-600">Соединение не установлено.</div>
                <button 
                  onClick={connectToGemini} 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                  disabled={isConnecting}
                >
                  {isConnecting ? 'Подключение...' : 'Connect'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Чат отображается только если установлено соединение */}
        {isConnected ? (
          <div className="flex flex-col h-[calc(100vh-350px)] border rounded-lg overflow-hidden">
            <div className="flex-grow p-4 overflow-y-auto bg-gray-50">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-10">
                  Начните диалог с Google Gemini...
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div key={index} className={`mb-4 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`px-4 py-2 rounded-lg max-w-[70%] ${
                      msg.sender === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-green-500 text-white'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start mb-4">
                  <div className="px-4 py-2 rounded-lg bg-green-500 text-white">
                    <span className="inline-block animate-pulse">...</span>
                  </div>
                </div>
              )}
            </div>
            <form onSubmit={handleSubmit} className="border-t p-3 bg-white">
              <div className="flex gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-grow border rounded px-3 py-2 min-h-[50px] resize-none"
                  placeholder="Введите сообщение..."
                  disabled={isLoading}
                />
                <button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:bg-blue-400"
                  disabled={isLoading || !input.trim()}
                >
                  Отправить
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            После подключения вы сможете вести диалог.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
