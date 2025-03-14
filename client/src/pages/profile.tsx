import { useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Profile() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");

  const updateProfile = useMutation({
    mutationFn: async (data: { email: string; phone: string }) => {
      const res = await apiRequest("PATCH", "/api/user", data);
      return res.json();
    },
    onSuccess: () => {
      setIsEditing(false);
      toast({
        title: "Профиль обновлен",
        description: "Ваши данные успешно сохранены",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка обновления",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Профиль пользователя</h1>
          <p className="text-muted-foreground">
            Управление вашим профилем и настройками
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Данные пользователя</CardTitle>
              {!isEditing && (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  Редактировать
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Имя пользователя
                </div>
                <div className="text-lg">{user?.username}</div>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Название компании
                </div>
                <div className="text-lg">{user?.companyName || "Не указано"}</div>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Email
                </div>
                {isEditing ? (
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Введите email"
                  />
                ) : (
                  <div className="text-lg">{user?.email || "Не указан"}</div>
                )}
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Телефон
                </div>
                {isEditing ? (
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Введите телефон"
                  />
                ) : (
                  <div className="text-lg">{user?.phone || "Не указан"}</div>
                )}
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Дата регистрации
                </div>
                <div className="text-lg">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("ru-RU", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "Не указано"}
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setEmail(user?.email || "");
                    setPhone(user?.phone || "");
                  }}
                >
                  Отмена
                </Button>
                <Button
                  onClick={() => updateProfile.mutate({ email, phone })}
                  disabled={updateProfile.isPending}
                >
                  {updateProfile.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Сохранение...
                    </>
                  ) : (
                    "Сохранить"
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}