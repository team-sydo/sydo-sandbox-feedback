
import { useState } from "react";
import { SydoLogo } from "./SydoLogo";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { LoginModal } from "./LoginModal";

interface NavBarProps {
  userName: string;
}

export function NavBar({ userName }: NavBarProps) {
  const { signOut, user } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleAuthAction = () => {
    if (user) {
      // Simply sign out without redirecting - the useAuth context will handle staying on the same page
      signOut();
    } else {
      setIsLoginModalOpen(true);
    }
  };

  return (
    <nav className="border-b py-4 px-6 flex justify-between items-center bg-white">
      <SydoLogo />
      <div className="flex items-center gap-4">
        {userName && (
          <div className="text-sm font-medium">
            {userName}
          </div>
        )}
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleAuthAction}
          className="flex items-center gap-2"
          title={user ? "Déconnexion" : "Connexion"}
        >
          {user ? (
            <>
              <LogOut className="h-4 w-4" />
              <span>Déconnexion</span>
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              <span>Connexion</span>
            </>
          )}
        </Button>
      </div>
      
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </nav>
  );
}
