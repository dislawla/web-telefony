import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/layout/dashboard-layout";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Phone, RefreshCcw } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Call, Contact, insertCallSchema } from "@shared/schema";
import * as z from 'zod';
import { BackButton } from "@/components/ui/back-button";

function formatDuration(seconds: number | undefined) {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function CallRecording({ url }: { url: string | undefined }) {
  if (!url) return null;
  return (
    <audio controls className="w-full max-w-xs">
      <source src={url} type="audio/mpeg" />
      Ваш браузер не поддерживает аудио элемент.
    </audio>
  );
}

function CallStatus({ status }: { status: string }) {
  const variant = {
    "in-progress": "default",
    "completed": "success",
    "failed": "destructive",
    "no-answer": "warning",
  }[status] || "default";

  const statusText = {
    "in-progress": "В процессе",
    "completed": "Завершен",
    "failed": "Ошибка",
    "no-answer": "Нет ответа",
  }[status] || status;

  return <Badge variant={variant}>{statusText}</Badge>;
}

function AIInsights({ call }: { call: Call }) {
  if (!call.aiSummary) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Анализ ИИ</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="font-medium mb-1">Тональность</div>
          <div>{call.aiSummary.sentiment}</div>
        </div>
        <div>
          <div className="font-medium mb-1">Следующие действия</div>
          <ul className="list-disc pl-4">
            {call.aiSummary.nextActions.map((action, i) => (
              <li key={i}>{action}</li>
            ))}
          </ul>
        </div>
        <div>
          <div className="font-medium mb-1">Ключевые слова</div>
          <div className="flex flex-wrap gap-2">
            {call.aiSummary.keywords.map((keyword, i) => (
              <Badge key={i} variant="outline">{keyword}</Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Calls() {
  const [location] = useLocation();
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const { toast } = useToast();
  const contactId = new URLSearchParams(location.split("?")[1]).get("contact");

  const { data: calls, isLoading: isLoadingCalls } = useQuery<Call[]>({
    queryKey: ["/api/calls"],
  });

  const { data: contacts, isLoading: isLoadingContacts } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
  });

  const form = useForm({
    resolver: zodResolver(insertCallSchema),
    defaultValues: {
      contactId: contactId || "",
      status: "pending",
    },
  });

  const initiateCall = useMutation<Call, Error, z.infer<typeof insertCallSchema>>({
    mutationFn: async (data) => {
      const res = await apiRequest("POST", "/api/calls", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calls"] });
      toast({
        title: "Звонок начат",
        description: "Звонок успешно инициирован.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка звонка",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const refreshCallStatus = useMutation<any, Error, number>({
    mutationFn: async (callId) => {
      const res = await apiRequest("GET", `/api/calls/${callId}/status`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calls"] });
    },
  });

  if (isLoadingCalls || isLoadingContacts) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <BackButton />
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Звонки</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Phone className="h-4 w-4 mr-2" />
                Новый звонок
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Начать новый звонок</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit((data) => initiateCall.mutate(data))}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="contactId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Контакт</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите контакт" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {contacts?.map((contact) => (
                              <SelectItem
                                key={contact.id}
                                value={contact.id.toString()}
                              >
                                {contact.name} ({contact.phone})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={initiateCall.isPending}
                  >
                    {initiateCall.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Сохранение...
                      </>
                    ) : (
                      "Начать звонок"
                    )}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Контакт</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Длительность</TableHead>
                <TableHead>Создан</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {calls?.map((call) => {
                const contact = contacts?.find((c) => c.id === call.contactId);
                return (
                  <TableRow
                    key={call.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedCall(call)}
                  >
                    <TableCell className="font-medium">
                      {contact?.name || "Неизвестно"}
                    </TableCell>
                    <TableCell>
                      <CallStatus status={call.status} />
                    </TableCell>
                    <TableCell>{formatDuration(call.duration)}</TableCell>
                    <TableCell>
                      {new Date(call.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          refreshCallStatus.mutate(call.id);
                        }}
                        disabled={refreshCallStatus.isPending}
                      >
                        <RefreshCcw className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {!calls?.length && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Звонков пока нет. Начните новый звонок.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {selectedCall && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Детали звонка</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="font-medium mb-1">Контакт</div>
                    <div>
                      {contacts?.find((c) => c.id === selectedCall.contactId)
                        ?.name || "Неизвестно"}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium mb-1">Статус</div>
                    <CallStatus status={selectedCall.status} />
                  </div>
                  <div>
                    <div className="font-medium mb-1">Длительность</div>
                    <div>{formatDuration(selectedCall.duration)}</div>
                  </div>
                  <div>
                    <div className="font-medium mb-1">Запись</div>
                    <CallRecording url={selectedCall.recordingUrl} />
                  </div>
                  {selectedCall.transcript && (
                    <div>
                      <div className="font-medium mb-1">Транскрипция</div>
                      <div className="whitespace-pre-wrap text-sm">
                        {selectedCall.transcript}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <AIInsights call={selectedCall} />
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}