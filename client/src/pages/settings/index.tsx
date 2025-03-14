import DashboardLayout from "@/components/layout/dashboard-layout";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// Схема валидации формы настроек телефонии
// Описывает структуру и правила валидации для всех полей формы
const telephonyFormSchema = z.object({
  apiKey: z.string().min(1, "API ключ обязателен"),
  incomingCalls: z.object({
    routing: z.enum(["sequential", "parallel"], {
      required_error: "Выберите тип маршрутизации",
    }),
    greeting: z.string().min(1, "Добавьте текст приветствия"),
    waitTime: z.string().min(1, "Укажите время ожидания"),
  }),
  outgoingCalls: z.object({
    phoneNumber: z.string().min(1, "Укажите номер телефона"),
    recordCalls: z.boolean(),
  }),
  aiIntegration: z.object({
    analyzeConversations: z.boolean(),
    transcriptionEnabled: z.boolean(),
  }),
});

// Тип данных формы, сгенерированный из схемы валидации
type TelephonyFormValues = z.infer<typeof telephonyFormSchema>;

export default function Settings() {
  const { toast } = useToast();

  // Инициализация формы с настройками по умолчанию
  const form = useForm<TelephonyFormValues>({
    resolver: zodResolver(telephonyFormSchema),
    defaultValues: {
      apiKey: "",
      incomingCalls: {
        routing: "sequential",
        greeting: "",
        waitTime: "30",
      },
      outgoingCalls: {
        phoneNumber: "",
        recordCalls: true,
      },
      aiIntegration: {
        analyzeConversations: true,
        transcriptionEnabled: true,
      },
    },
  });

  // Обработчик отправки формы
  async function onSubmit(data: TelephonyFormValues) {
    try {
      // Здесь будет логика сохранения настроек в базу данных
      toast({
        title: "Настройки сохранены",
        description: "Настройки телефонии успешно обновлены",
      });
    } catch (error) {
      toast({
        title: "Ошибка сохранения",
        description: error instanceof Error ? error.message : "Неизвестная ошибка",
        variant: "destructive",
      });
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Заголовок страницы */}
        <div>
          <h1 className="text-3xl font-bold">Настройки телефонии</h1>
          <p className="text-muted-foreground">
            Управление настройками телефонной системы
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Блок API ключа */}
            <Card>
              <CardHeader>
                <CardTitle>API ключ</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="apiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API ключ телефонии</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Блок настроек входящих звонков */}
            <Card>
              <CardHeader>
                <CardTitle>Входящие звонки</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Настройка маршрутизации звонков */}
                <FormField
                  control={form.control}
                  name="incomingCalls.routing"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Маршрутизация звонков</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите тип маршрутизации" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="sequential">
                            Последовательная
                          </SelectItem>
                          <SelectItem value="parallel">
                            Параллельная
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Настройка голосового приветствия */}
                <FormField
                  control={form.control}
                  name="incomingCalls.greeting"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Голосовое приветствие</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Настройка времени ожидания */}
                <FormField
                  control={form.control}
                  name="incomingCalls.waitTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Время ожидания (секунды)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" min="0" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Блок настроек исходящих звонков */}
            <Card>
              <CardHeader>
                <CardTitle>Исходящие звонки</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Настройка номера телефона */}
                <FormField
                  control={form.control}
                  name="outgoingCalls.phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Номер для исходящих</FormLabel>
                      <FormControl>
                        <Input {...field} type="tel" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Настройка записи звонков */}
                <FormField
                  control={form.control}
                  name="outgoingCalls.recordCalls"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Запись звонков</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Записывать все исходящие звонки
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Блок настроек интеграции с ИИ */}
            <Card>
              <CardHeader>
                <CardTitle>Интеграция с ИИ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Настройка анализа разговоров */}
                <FormField
                  control={form.control}
                  name="aiIntegration.analyzeConversations"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Анализ разговоров</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Анализировать разговоры с помощью ИИ
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Настройка транскрибации */}
                <FormField
                  control={form.control}
                  name="aiIntegration.transcriptionEnabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Транскрибация</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Преобразовывать речь в текст
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Кнопка сохранения настроек */}
            <Button type="submit" className="w-full">
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Сохранение...
                </>
              ) : (
                "Сохранить настройки"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
}