import { useState } from "react";
import { Button } from "./button";
import { Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AvatarUploadProps {
  currentAvatar?: string;
  onUpload: (url: string) => void;
}

export function AvatarUpload({ currentAvatar, onUpload }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверяем размер файла (максимум 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Ошибка",
        description: "Размер файла не должен превышать 5MB",
        variant: "destructive",
      });
      return;
    }

    // Проверяем тип файла
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, загрузите изображение",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await apiRequest("POST", "/api/upload/avatar", formData);
      const data = await response.json();

      if (response.ok) {
        onUpload(data.url);
        toast({
          title: "Успешно",
          description: "Аватар успешно загружен",
        });
      } else {
        throw new Error(data.message || "Ошибка при загрузке аватара");
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Ошибка при загрузке аватара",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-24 w-24">
        {currentAvatar ? (
          <>
            <img
              src={currentAvatar}
              alt="Аватар"
              className="h-full w-full rounded-full object-cover"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute -right-2 -top-2 h-6 w-6 rounded-full"
              onClick={() => onUpload("")}
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">
            <Upload className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
      </div>
      <div>
        <input
          type="file"
          id="avatar-upload"
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        <label htmlFor="avatar-upload">
          <Button
            variant="outline"
            asChild
            disabled={isUploading}
          >
            <span>
              {isUploading ? "Загрузка..." : "Загрузить аватар"}
            </span>
          </Button>
        </label>
      </div>
    </div>
  );
} 