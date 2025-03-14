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

const mttSettingsSchema = z.object({
  mttApiKey: z.string().min(1, "Требуется"),
  mttPhoneNumber: z.string().min(1, "Требуется"),
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Настройки</h1>

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
      </div>
    </DashboardLayout>
  );
}