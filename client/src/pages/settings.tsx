import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const mttSettingsSchema = z.object({
  mttApiKey: z.string().min(1, "Требуется"),
  mttPhoneNumber: z.string().min(1, "Требуется"),
});

const crmSettingsSchema = z.object({
  amocrmDomain: z.string().min(1, "Требуется"),
  amocrmAccessToken: z.string().min(1, "Требуется"),
});

export default function Settings() {
  const { toast } = useToast();

  const mttForm = useForm({
    resolver: zodResolver(mttSettingsSchema),
    defaultValues: {
      mttApiKey: "",
      mttPhoneNumber: "",
    },
  });

  const crmForm = useForm({
    resolver: zodResolver(crmSettingsSchema),
    defaultValues: {
      amocrmDomain: "",
      amocrmAccessToken: "",
    },
  });

  const updateMttSettings = useMutation({
    mutationFn: async (data: z.infer<typeof mttSettingsSchema>) => {
      const res = await apiRequest("POST", "/api/settings/mtt", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Настройки обновлены",
        description: "Настройки MTT успешно сохранены.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка обновления настроек",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateCrmSettings = useMutation({
    mutationFn: async (data: z.infer<typeof crmSettingsSchema>) => {
      const res = await apiRequest("POST", "/api/settings/crm", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Настройки обновлены",
        description: "Настройки CRM успешно сохранены.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка обновления настроек",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Настройки</h1>

        <Tabs defaultValue="telephony">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="telephony">Телефония</TabsTrigger>
            <TabsTrigger value="crm">CRM Система</TabsTrigger>
          </TabsList>

          <TabsContent value="telephony">
            <Card>
              <CardHeader>
                <CardTitle>Настройки телефонии MTT</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...mttForm}>
                  <form
                    onSubmit={mttForm.handleSubmit((data) =>
                      updateMttSettings.mutate(data)
                    )}
                    className="space-y-4"
                  >
                    <FormField
                      control={mttForm.control}
                      name="mttApiKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>API Ключ MTT</FormLabel>
                          <FormControl>
                            <Input {...field} type="password" />
                          </FormControl>
                          <FormDescription>
                            Ваш API ключ от MTT для совершения звонков
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={mttForm.control}
                      name="mttPhoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Номер телефона MTT</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="+7XXXXXXXXXX" />
                          </FormControl>
                          <FormDescription>
                            Номер телефона в формате +7XXXXXXXXXX
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={updateMttSettings.isPending}>
                      {updateMttSettings.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Сохранить настройки MTT"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="crm">
            <Card>
              <CardHeader>
                <CardTitle>Настройки AmoCRM</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...crmForm}>
                  <form
                    onSubmit={crmForm.handleSubmit((data) =>
                      updateCrmSettings.mutate(data)
                    )}
                    className="space-y-4"
                  >
                    <FormField
                      control={crmForm.control}
                      name="amocrmDomain"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Домен AmoCRM</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="company.amocrm.ru" />
                          </FormControl>
                          <FormDescription>
                            Домен вашей AmoCRM системы
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={crmForm.control}
                      name="amocrmAccessToken"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Access Token</FormLabel>
                          <FormControl>
                            <Input {...field} type="password" />
                          </FormControl>
                          <FormDescription>
                            API ключ доступа к AmoCRM
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={updateCrmSettings.isPending}>
                      {updateCrmSettings.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Сохранить настройки CRM"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}