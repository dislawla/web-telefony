import { useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Profile() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const updateProfile = useMutation({
    mutationFn: async (data: { email: string; phone: string }) => {
      const response = await apiRequest("PATCH", "/api/user", data);
      return response.json();
    },
    onSuccess: () => {
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Профиль обновлен",
        description: "Ваши данные успешно сохранены",
      });
      setErrors({});
    },
    onError: (error: any) => {
      if (error.errors) {
        const fieldErrors = error.errors.reduce((acc: any, err: any) => {
          acc[err.field] = err.message;
          return acc;
        }, {});
        setErrors(fieldErrors);
      }
      toast({
        title: "Ошибка обновления",
        description: error.message || "Произошла ошибка при обновлении профиля",
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
                  <div>
                    <Input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Введите email"
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                    )}
                  </div>
                ) : (
                  <div className="text-lg">{user?.email || "Не указан"}</div>
                )}
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Телефон
                </div>
                {isEditing ? (
                  <div>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Введите телефон"
                      className={errors.phone ? "border-red-500" : ""}
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                    )}
                  </div>
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
                    setErrors({});
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