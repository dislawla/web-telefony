import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  connected?: boolean;
  message?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Метод ${req.method} не разрешён` });
  }

  const { apiKey } = req.body;

  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
    return res.status(400).json({ message: "API key не указан" });
  }

  // Используем переменные окружения для параметров проекта Gemini
  const projectId = process.env.GOOGLE_GEMINI_PROJECT_ID || 'loyal-framework-454512-t4';
  const location = process.env.GOOGLE_GEMINI_LOCATION || 'us-central1';
  const agentId = process.env.GOOGLE_GEMINI_AGENT_ID || 'YOUR_AGENT_ID';

  // Формируем URL согласно документации Gemini API
  const geminiUrl = `https://gemini.googleapis.com/v1/projects/${projectId}/locations/${location}/agents/${agentId}:streamChat`;

  try {
    // Отправляем тестовый запрос к Gemini API
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        query: "Hello, Gemini!"
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ message: `Ошибка Gemini API: ${errorText}` });
    }

    const data = await response.json();
    return res.status(200).json({ 
      connected: true, 
      message: 'Соединение установлено. Ответ Gemini API: ' + JSON.stringify(data) 
    });
  } catch (error: any) {
    console.error('Ошибка при вызове Gemini API:', error);
    return res.status(500).json({ message: 'Внутренняя ошибка сервера при подключении к Gemini API.' });
  }
}
