import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface AvatarEditProps {
  imageUrl: string;
  onCropComplete: (position: { x: number; y: number }, size: number) => void;
  onCancel: () => void;
}

export const AvatarEdit = ({ imageUrl, onCropComplete, onCancel }: AvatarEditProps) => {
  const [cropPosition, setCropPosition] = useState({ x: 50, y: 50 });
  const [cropSize, setCropSize] = useState(100);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    const y = ((e.clientY - containerRect.top) / containerRect.height) * 100;
    
    setCropPosition({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -5 : 5;
    setCropSize(prev => Math.max(20, Math.min(100, prev + delta)));
  };

  const handleSave = () => {
    try {
      setIsLoading(true);
      onCropComplete(cropPosition, cropSize);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при сохранении аватара",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-white rounded-lg shadow-md">
      <div className="text-sm text-gray-500 mb-2">
        Перетаскивайте круглую область и используйте колесико мыши для изменения размера
      </div>
      <div
        ref={containerRef}
        className="relative w-full h-[400px] bg-gray-100 rounded-lg overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <img
          src={imageUrl}
          alt="Аватар"
          className="w-full h-full object-contain"
        />
        <div
          className="absolute rounded-full border-4 border-white shadow-lg cursor-move"
          style={{
            width: `${cropSize}%`,
            height: `${cropSize}%`,
            left: `${cropPosition.x - cropSize/2}%`,
            top: `${cropPosition.y - cropSize/2}%`,
          }}
          onMouseDown={handleMouseDown}
        />
        <div
          className="absolute inset-0 bg-black/30"
          style={{
            clipPath: `circle(${cropSize/2}% at ${cropPosition.x}% ${cropPosition.y}%)`,
            WebkitClipPath: `circle(${cropSize/2}% at ${cropPosition.x}% ${cropPosition.y}%)`,
          }}
        />
      </div>

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