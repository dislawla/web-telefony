import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface AvatarEditProps {
  imageUrl: string;
  onCropComplete: (croppedImage: Blob) => void;
  onCancel: () => void;
}

export const AvatarEdit = ({ imageUrl, onCropComplete, onCancel }: AvatarEditProps) => {
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 50,
    height: 50,
    x: 25,
    y: 25
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!crop) return;

    try {
      setIsLoading(true);
      const image = new Image();
      image.src = imageUrl;

      await new Promise((resolve) => {
        image.onload = resolve;
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Размер холста будет равен размеру выбранной области
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      canvas.width = 200; // Фиксированный размер для аватара
      canvas.height = 200;

      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
      );

      canvas.toBlob(
        (blob) => {
          if (blob) {
            onCropComplete(blob);
          }
        },
        'image/jpeg',
        0.95
      );
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обрезать изображение",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-white rounded-lg shadow-md">
      <div className="text-sm text-gray-500 mb-2">
        Выберите область для аватара
      </div>
      <ReactCrop
        crop={crop}
        onChange={c => setCrop(c)}
        aspect={1}
        circularCrop
      >
        <img src={imageUrl} alt="Аватар" />
      </ReactCrop>

      <div className="flex gap-2 w-full justify-center">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="min-w-[100px]"
        >
          Отмена
        </Button>
        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="min-w-[100px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Сохранение...
            </>
          ) : (
            "Сохранить"
          )}
        </Button>
      </div>
    </div>
  );
}; 