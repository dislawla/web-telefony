import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import DashboardLayout from "@/components/layout/dashboard-layout";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const databaseFormSchema = z.object({
  host: z.string().min(1, "Укажите хост базы данных"),
  port: z.string().min(1, "Укажите порт"),
  database: z.string().min(1, "Укажите название базы данных"),
  username: z.string().min(1, "Укажите имя пользователя"),
  password: z.string().min(1, "Укажите пароль"),
});

type DatabaseFormValues = z.infer<typeof databaseFormSchema>;

export default function DatabaseSettings() {
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const form = useForm<DatabaseFormValues>({
    resolver: zodResolver(databaseFormSchema),
    defaultValues: {
      host: "",
      port: "5432",
      database: "",
      username: "",
      password: "",
    },
  });

  async function onSubmit(data: DatabaseFormValues) {
    setIsConnecting(true);
    try {
      // Здесь будет логика подключения к базе данных
      toast({
        title: "Подключение установлено",
        description: "База данных успешно подключена",
      });
    } catch (error) {
      toast({
        title: "Ошибка подключения",
        description: error instanceof Error ? error.message : "Неизвестная ошибка",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Настройки базы данных</h1>
          <p className="text-muted-foreground">
            Настройте подключение к вашей базе данных PostgreSQL
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Параметры подключения</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="host"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Хост</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="localhost" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="port"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Порт</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="database"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>База данных</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Имя пользователя</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Пароль</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isConnecting}>
                  {isConnecting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Подключение...
                    </>
                  ) : (
                    "Подключиться"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
