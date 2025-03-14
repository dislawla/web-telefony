import axios from "axios";

export interface CallResult {
  id: string;
  status: string;
  duration: number;
  recordingUrl?: string;
}

export async function makeCall(to: string, fromNumber: string, apiKey: string): Promise<CallResult> {
  if (!apiKey || !fromNumber) {
    throw new Error("Не заданы учетные данные MTT");
  }

  const api = axios.create({
    baseURL: "https://api.mtt.ru",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    }
  });

  try {
    const response = await api.post("/v1/calls", {
      from: fromNumber,
      to: to,
      voice: "alice", // Используем голос Alice для озвучивания
      text: "Здравствуйте, это автоматический звонок."
    });

    return {
      id: response.data.id,
      status: response.data.status,
      duration: response.data.duration || 0,
      recordingUrl: response.data.recording_url
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Не удалось совершить звонок: ${error.message}`);
    }
    throw error;
  }
}

export async function getCallStatus(callId: string, apiKey: string): Promise<string> {
  if (!apiKey) {
    throw new Error("Не задан API ключ MTT");
  }

  const api = axios.create({
    baseURL: "https://api.mtt.ru",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    }
  });

  try {
    const response = await api.get(`/v1/calls/${callId}`);
    return response.data.status;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Не удалось получить статус звонка: ${error.message}`);
    }
    throw error;
  }
}

export async function getRecording(callId: string, apiKey: string): Promise<string | undefined> {
  if (!apiKey) {
    throw new Error("Не задан API ключ MTT");
  }

  const api = axios.create({
    baseURL: "https://api.mtt.ru",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    }
  });

  try {
    const response = await api.get(`/v1/calls/${callId}/recording`);
    return response.data.url;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Не удалось получить запись звонка: ${error.message}`);
    }
    throw error;
  }
}