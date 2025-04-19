import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';

interface Recording {
  id: string;
  createdAt: string;
  transcription: string;
  audioUrl: string;
}

interface RecordingsListProps {
  recordings: Recording[];
  isLoading?: boolean;
}

export function RecordingsList({ recordings = [], isLoading = false }: RecordingsListProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Записи</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {isLoading ? (
            <p className="text-muted-foreground text-center">Загрузка записей...</p>
          ) : recordings.length === 0 ? (
            <p className="text-muted-foreground text-center">Нет записей</p>
          ) : (
            recordings.map((recording) => (
              <div
                key={recording.id}
                className="mb-4 p-4 border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm text-muted-foreground">
                    {new Date(recording.createdAt).toLocaleString()}
                  </p>
                </div>
                <p className="text-sm mb-2">{recording.transcription}</p>
                <audio controls src={recording.audioUrl} className="w-full" />
              </div>
            ))
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 