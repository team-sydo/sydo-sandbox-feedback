
import { Home } from "lucide-react";

export function SydoLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="bg-blue-500 rounded-md p-2 text-white">
        <Home className="h-5 w-5" />
      </div>
      <span className="font-bold text-xl">Sydo Reviews</span>
    </div>
  );
}
