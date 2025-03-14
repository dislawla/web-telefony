import DashboardLayout from "@/components/layout/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function Profile() {
  const { user, isLoading } = useAuth();

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
            <CardTitle>Данные пользователя</CardTitle>
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
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
