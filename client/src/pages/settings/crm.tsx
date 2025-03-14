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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const crmSettingsSchema = z.object({
  domain: z.string().min(1, "Введите домен CRM"),
  apiKey: z.string().min(1, "Введите API ключ"),
});

type CrmSettingsValues = z.infer<typeof crmSettingsSchema>;

export default function CRMSettings() {
  const { toast } = useToast();

  const form = useForm<CrmSettingsValues>({
    resolver: zodResolver(crmSettingsSchema),
    defaultValues: {
      domain: "",
      apiKey: "",
    },
  });

  const updateSettings = useMutation({
    mutationFn: async (data: CrmSettingsValues) => {
      const res = await apiRequest("POST", "/api/settings/crm", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Настройки сохранены",
        description: "Настройки CRM успешно обновлены",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка сохранения",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Настройки CRM</h1>
          <p className="text-muted-foreground">
            Управление интеграцией с CRM системой
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Подключение CRM</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) => updateSettings.mutate(data))}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="domain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Домен CRM</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="company.crm.ru" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="apiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API ключ</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={updateSettings.isPending}
                >
                  {updateSettings.isPending ? (
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
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}