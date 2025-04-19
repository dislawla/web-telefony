import React, { useState, useEffect } from 'react';
import { CallRecorder } from '@/components/CallRecorder';
import { RecordingsList } from '@/components/RecordingsList';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

interface Recording {
  id: string;
  createdAt: string;
  transcription: string;
  audioUrl: string;
}

export default function TestRecording() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchRecordings = async () => {
      if (!user) return;
      
      try {
        console.log('Fetching recordings for user:', user.id);
        const response = await fetch(`/api/recordings/user/${user.id}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch recordings');
        }
        const data = await response.json();
        console.log('Received recordings:', data);
        
        setRecordings(data.map((recording: any) => ({
          id: recording.id,
          createdAt: recording.createdAt,
          transcription: recording.transcription || 'Транскрипция обрабатывается...',
          audioUrl: `/uploads/${recording.filename}`
        })));
      } catch (error) {
        console.error('Error fetching recordings:', error);
        toast({
          title: "Ошибка при загрузке записей",
          description: error instanceof Error ? error.message : "Не удалось загрузить список записей.",
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
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('userId', user?.id.toString() || '');
      formData.append('callId', '1'); // Временный ID для тестирования

      const response = await fetch('/api/recordings/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload recording');
      }

      const newRecording = await response.json();
      setRecordings(prev => [...prev, {
        id: newRecording.id,
        createdAt: newRecording.createdAt,
        transcription: newRecording.transcription || 'Транскрипция обрабатывается...',
        audioUrl: `/uploads/recordings/${newRecording.filename}`
      }]);

      toast({
        title: "Запись успешно сохранена",
        description: "Ваша запись была успешно загружена на сервер.",
      });
    } catch (error) {
      console.error('Error uploading recording:', error);
      toast({
        title: "Ошибка при сохранении записи",
        description: error instanceof Error ? error.message : "Не удалось загрузить запись на сервер. Пожалуйста, попробуйте снова.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto py-6">
        <p className="text-center text-muted-foreground">Пожалуйста, войдите в систему для доступа к записям</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <h1 className="text-2xl font-bold">Тестовая запись</h1>
      
      <div className="grid gap-8">
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Запись звука</h2>
          <CallRecorder onRecordingComplete={handleRecordingComplete} />
        </div>

        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Список записей</h2>
          <RecordingsList recordings={recordings} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
} 