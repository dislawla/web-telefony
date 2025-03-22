import axios from "axios";

/**
 * Отправляет сообщение в ChatGPT и возвращает ответ.
 * @param message - Запрос пользователя
 * @returns Ответ ChatGPT в виде строки
 */
export async function askChatGPT(message: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY не задан в переменных окружения");
  }
  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-3.5-turbo", // или "gpt-4", если имеется доступ
      messages: [{ role: "user", content: message }],
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
    }
  );
  const reply = response.data.choices[0].message.content;
  return reply;
}