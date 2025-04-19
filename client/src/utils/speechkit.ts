interface SpeechKitResponse {
  result: string;
}

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  try {
    console.log('Starting audio transcription...');
    
    // Конвертируем аудио в base64
    const base64Audio = await blobToBase64(audioBlob);
    console.log('Audio converted to base64');
    
    // Подготавливаем данные для запроса
    const requestData = {
      config: {
        specification: {
          languageCode: 'ru-RU',
          model: 'general',
          profanityFilter: false,
          audioEncoding: 'WEBM_OPUS',
          sampleRateHertz: 48000,
        },
      },
      audio: {
        content: base64Audio,
      },
    };

    console.log('Sending request to Yandex Speech Kit...');
    
    // Создаем объект заголовков
    const headers = new Headers({
      'Authorization': `Api-Key ${import.meta.env.VITE_YANDEX_CLOUD_API_KEY}`,
      'x-folder-id': import.meta.env.VITE_YANDEX_CLOUD_FOLDER_ID || '',
      'Content-Type': 'application/json',
    });

    // Отправляем запрос на распознавание
    const response = await fetch('https://stt.api.cloud.yandex.net/speech/v1/stt:recognize', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Speech recognition failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Speech recognition failed: ${response.status} ${errorText}`);
    }

    const data: SpeechKitResponse = await response.json();
    console.log('Transcription received:', data);
    return data.result;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
}

// Вспомогательная функция для конвертации Blob в base64
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        // Удаляем префикс "data:audio/webm;base64," из результата
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
} 