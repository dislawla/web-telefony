import React, { useState, useEffect } from 'react';
import { CallRecorder } from '../components/CallRecorder';
import { RecordingsList } from '../components/RecordingsList';
import { useAuth } from '@/hooks/use-auth';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { useToast } from '@/hooks/use-toast';

export const TestRecording: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState<string>('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordings, setRecordings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка существующих записей
  useEffect(() => {
    const fetchRecordings = async () => {
      if (!user) return;

      try {
        const response = await fetch(`/api/recordings/user/${user.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch recordings');
        }

        const data = await response.json();
        setRecordings(data.map((recording: any) => ({
          id: recording.id,
          createdAt: recording.createdAt,
          transcription: recording.transcription || 'Транскрипция обрабатывается...',
          audioUrl: `/api/uploads/${recording.fileName}`
        })));
      } catch (error) {
        console.error('Error fetching recordings:', error);
        toast({
          title: "Ошибка при загрузке записей",
          description: "Не удалось загрузить существующие записи.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecordings();
  }, [user, toast]);

  const handleRecordingComplete = async (audioBlob: Blob) => {
    try {
      setIsTranscribing(true);
      
      // Создаем FormData для отправки аудио
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      formData.append('userId', user?.id.toString() || '');
      formData.append('callId', '1'); // Тестовый ID звонка

      console.log('Uploading recording for SpeechSense processing...');
      const response = await fetch('/api/recordings/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed:', response.status, errorText);
        throw new Error(`Failed to upload recording: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('Recording uploaded successfully:', data);

      // Обновляем список записей
      setRecordings(prev => [...prev, {
        id: data.id,
        createdAt: data.createdAt,
        transcription: data.transcription || 'Транскрипция обрабатывается...',
        audioUrl: `/api/uploads/${data.filename}`
      }]);

      toast({
        title: "Запись успешно сохранена",
        description: "Ваша запись была успешно загружена на сервер.",
      });
    } catch (error) {
      console.error('Error processing recording:', error);
      toast({
        title: "Ошибка при сохранении записи",
        description: error instanceof Error ? error.message : "Не удалось загрузить запись на сервер.",
        variant: "destructive",
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 space-y-8">
        {!user ? (
          <div className="text-center py-8">
            <p className="text-lg text-muted-foreground">Пожалуйста, войдите в систему для тестирования записи</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <h1 className="text-2xl font-bold">Тест записи звонков (SpeechSense)</h1>
              <p className="text-muted-foreground">
                Нажмите кнопку "Начать запись" для начала записи. После остановки записи
                она автоматически загрузится на сервер и будет обработана SpeechSense.
              </p>
              <CallRecorder onRecordingComplete={handleRecordingComplete} />
              
              {isTranscribing && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-sm text-muted-foreground">Распознавание речи...</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold">Ваши записи</h2>
              <RecordingsList recordings={recordings} isLoading={isLoading || isTranscribing} />
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}; 