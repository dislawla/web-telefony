import axios from "axios";

/**
 * Отправляет запрос к OpenAI ChatGPT и возвращает ответ.
 * @param message - Текст запроса от пользователя
 * @returns Ответ ChatGPT в виде строки
 * @throws Ошибка, если OPENAI_API_KEY не установлен или запрос завершился с ошибкой.
 */
export async function askChatGPT(message: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY не задан в переменных окружения");
  }

  try {
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

    return response.data.choices[0].message.content;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Ошибка запроса к OpenAI API: ${error.message}`);
    }
    throw error;
  }
}
