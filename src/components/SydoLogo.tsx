
import { Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface SydoLogoProps {
  className?: string;
}

export function SydoLogo({ className }: SydoLogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="bg-blue-500 rounded-md p-2 text-white">
        <Home className="h-5 w-5" />
      </div>
      <span className="font-bold text-xl">Sydo Reviews</span>
    </div>
  );
}
