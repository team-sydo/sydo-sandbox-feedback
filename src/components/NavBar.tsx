
import { SydoLogo } from "./SydoLogo";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface NavBarProps {
  userName: string;
}

export function NavBar({ userName }: NavBarProps) {
  const { signOut } = useAuth();

  return (
    <nav className="border-b py-4 px-6 flex justify-between items-center bg-white">
      <SydoLogo />
      <div className="flex items-center gap-4">
        <div className="text-sm font-medium">
          {userName}
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={signOut}
          title="Déconnexion"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </nav>
  );
}
