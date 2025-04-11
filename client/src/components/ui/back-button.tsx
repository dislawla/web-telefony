import { Button } from "./button";
import { ChevronLeft } from "lucide-react";
import { useLocation } from "wouter";

export function BackButton() {
  const [, setLocation] = useLocation();

  const goBack = () => {
    window.history.back();
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={goBack}
      className="mb-4"
    >
      <ChevronLeft className="h-4 w-4" />
    </Button>
  );
} 