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
import { AvatarUpload } from "@/components/ui/avatar-upload";
import { AvatarEdit } from "@/components/ui/avatar-edit";

export default function Profile() {
  const { user, isLoading, setUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoadingAvatar, setIsLoadingAvatar] = useState(false);

  const updateProfile = useMutation({
    mutationFn: async (data: { email: string; phone: string }) => {
      const res = await apiRequest("PUT", "/api/auth/user", data);
      return await res.json();
    },
    onSuccess: (data) => {
      setUser(data);
      setIsEditing(false);
      toast({
        title: "Профиль обновлен",
        description: "Ваши данные успешно сохранены",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAvatarUpload = async (file: File) => {
    try {
      setIsLoadingAvatar(true);
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload avatar");
      }

      const data = await response.json();
      setUser({ ...user!, avatar_url: data.url });
      toast({
        title: "Аватар обновлен",
        description: "Ваш аватар успешно загружен",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить аватар",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAvatar(false);
    }
  };

  const handleAvatarEditComplete = async (croppedImage: Blob) => {
    try {
      setIsLoadingAvatar(true);
      const formData = new FormData();
      formData.append("avatar", croppedImage, "cropped-avatar.jpg");

      const response = await fetch("/api/upload/avatar", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload cropped avatar");
      }

      const data = await response.json();
      setUser({ ...user, avatar_url: data.avatarUrl });
      setIsEditingAvatar(false);
      toast({
        title: "Успех",
        description: "Аватар обновлен",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить аватар",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAvatar(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Профиль</h1>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>Редактировать</Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Аватар</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <AvatarUpload
                currentAvatar={user.avatar_url}
                onAvatarChange={(url) => setUser({ ...user, avatar_url: url })}
                onEditClick={() => setIsEditingAvatar(true)}
              />
              {isEditingAvatar && user.avatar_url && (
                <AvatarEdit
                  imageUrl={user.avatar_url}
                  onCropComplete={handleAvatarEditComplete}
                  onCancel={() => setIsEditingAvatar(false)}
                />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Информация о профиле</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Имя пользователя</label>
                <Input value={user.username} disabled />
              </div>
              <div>
                <label className="text-sm font-medium">Название компании</label>
                <Input value={user.companyName} disabled />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Телефон</label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              {isEditing && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      updateProfile.mutate({ email, phone });
                    }}
                    disabled={updateProfile.isPending}
                  >
                    {updateProfile.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      "Сохранить"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setEmail(user.email || "");
                      setPhone(user.phone || "");
                    }}
                  >
                    Отмена
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}